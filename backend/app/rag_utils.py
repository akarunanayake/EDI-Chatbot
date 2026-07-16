import json
import math
import os

from .models import SupportingDocument, SupportingDocumentChunk, SupportingDocumentChunkVector


MAX_INDEXED_CHARS = 120000
CHUNK_SIZE = 1200
CHUNK_OVERLAP = 200
EMBEDDING_MODEL = os.getenv("RAG_EMBEDDING_MODEL", "text-embedding-3-small")


def normalize_text(text: str) -> str:
    return " ".join((text or "").split())


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    normalized = normalize_text(text)
    if not normalized:
        return []

    clipped = normalized[:MAX_INDEXED_CHARS]
    if len(clipped) <= chunk_size:
        return [clipped]

    chunks = []
    start = 0
    step = max(1, chunk_size - overlap)

    while start < len(clipped):
        end = min(len(clipped), start + chunk_size)
        chunk = clipped[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(clipped):
            break
        start += step

    return chunks


def _embedding_for_texts(client, texts: list[str]) -> list[list[float]]:
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts,
    )
    return [item.embedding for item in response.data]


def _backfill_missing_vectors(db, client, session_id: str):
    existing_chunk_ids = {
        row[0]
        for row in db.query(SupportingDocumentChunkVector.chunk_id)
        .filter(SupportingDocumentChunkVector.session_id == session_id)
        .all()
    }

    chunk_rows = (
        db.query(SupportingDocumentChunk)
        .filter(SupportingDocumentChunk.session_id == session_id)
        .order_by(SupportingDocumentChunk.id.asc())
        .all()
    )

    missing_chunks = [row for row in chunk_rows if row.id not in existing_chunk_ids]
    if not missing_chunks:
        return 0

    batch_size = 64
    created = 0
    for start in range(0, len(missing_chunks), batch_size):
        batch = missing_chunks[start:start + batch_size]
        embeddings = _embedding_for_texts(client, [row.content for row in batch])

        for row, embedding in zip(batch, embeddings):
            db.add(
                SupportingDocumentChunkVector(
                    chunk_id=row.id,
                    session_id=row.session_id,
                    supporting_document_id=row.supporting_document_id,
                    embedding_model=EMBEDDING_MODEL,
                    embedding_json=json.dumps(embedding),
                )
            )
            created += 1

    db.flush()
    return created


def index_supporting_document_chunks(db, client, session_id: str, supporting_doc_id: int, text: str):
    chunks = chunk_text(text)
    if not chunks:
        return 0

    embeddings = _embedding_for_texts(client, chunks)

    for idx, chunk in enumerate(chunks):
        chunk_row = SupportingDocumentChunk(
            session_id=session_id,
            supporting_document_id=supporting_doc_id,
            chunk_index=idx,
            content=chunk,
            content_lower=chunk.lower(),
        )
        db.add(chunk_row)
        db.flush()

        vector_row = SupportingDocumentChunkVector(
            chunk_id=chunk_row.id,
            session_id=session_id,
            supporting_document_id=supporting_doc_id,
            embedding_model=EMBEDDING_MODEL,
            embedding_json=json.dumps(embeddings[idx]),
        )
        db.add(vector_row)

    return len(chunks)


def _cosine_similarity(vector_a: list[float], vector_b: list[float]) -> float:
    if not vector_a or not vector_b or len(vector_a) != len(vector_b):
        return -1.0

    dot = sum(a * b for a, b in zip(vector_a, vector_b))
    norm_a = math.sqrt(sum(a * a for a in vector_a))
    norm_b = math.sqrt(sum(b * b for b in vector_b))
    if norm_a == 0 or norm_b == 0:
        return -1.0

    return dot / (norm_a * norm_b)


def retrieve_supporting_doc_context(db, client, session_id: str, query: str, top_k: int = 5, max_chars: int = 5000) -> str:
    _backfill_missing_vectors(db, client, session_id)

    rows = (
        db.query(SupportingDocumentChunk, SupportingDocumentChunkVector, SupportingDocument)
        .join(
            SupportingDocumentChunkVector,
            SupportingDocumentChunkVector.chunk_id == SupportingDocumentChunk.id,
        )
        .join(
            SupportingDocument,
            SupportingDocument.id == SupportingDocumentChunk.supporting_document_id,
        )
        .filter(SupportingDocumentChunkVector.session_id == session_id)
        .order_by(SupportingDocument.uploaded_at.desc(), SupportingDocumentChunk.chunk_index.asc())
        .all()
    )

    if not rows:
        return ""

    query_text = (query or "").strip()
    if not query_text:
        query_text = "Summarise the most relevant supporting document guidance for this lesson discussion."

    query_embedding = _embedding_for_texts(client, [query_text])[0]

    scored = []
    for chunk_row, vector_row, doc_row in rows:
        try:
            chunk_embedding = json.loads(vector_row.embedding_json)
        except Exception:
            continue

        score = _cosine_similarity(query_embedding, chunk_embedding)
        if score < 0:
            continue
        scored.append((score, chunk_row, doc_row))

    if not scored:
        return ""

    scored.sort(key=lambda item: item[0], reverse=True)
    selected = [(chunk_row, doc_row) for _, chunk_row, doc_row in scored[:top_k]]

    context_parts = ["Supporting document excerpts (session knowledge base):"]
    used_chars = len(context_parts[0])
    for chunk_row, doc_row in selected:
        excerpt = (chunk_row.content or "").strip()
        if not excerpt:
            continue

        block = f"\n\n[Document: {doc_row.document_name} | Chunk {chunk_row.chunk_index + 1}]\n{excerpt}"
        if used_chars + len(block) > max_chars:
            break
        context_parts.append(block)
        used_chars += len(block)

    if len(context_parts) == 1:
        return ""

    return "".join(context_parts)