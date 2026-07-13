from .models import ChatSession, Message


MAX_PREVIEW_LENGTH = 100


def _truncate_preview(text: str, max_len: int = MAX_PREVIEW_LENGTH) -> str:
    text = (text or "").strip()
    if len(text) <= max_len:
        return text
    return text[:max_len].rstrip() + "..."


def _first_n_words(text: str, word_count: int = 100) -> str:
    normalized = " ".join((text or "").split())
    if not normalized:
        return ""

    words = normalized.split(" ")
    if len(words) <= word_count:
        return normalized

    return " ".join(words[:word_count]) + "..."


def _normalize_preview_text(text: str) -> str:
    content = (text or "").strip()
    if not content:
        return ""

    if content.startswith("📎 [View lesson plan:"):
        return "Lesson plan uploaded"

    if content.startswith("📎 [View supporting document:"):
        return "Supporting document uploaded"

    first_line = content.splitlines()[0].strip()
    return " ".join(first_line.split())


def derive_session_preview(session_id: str, db) -> str:
    session = db.query(ChatSession).filter_by(id=session_id).first()
    lesson_text = ""
    if session:
        lesson_text = (session.original_lesson or "").strip()

    if lesson_text:
        return _first_n_words(lesson_text, 100)

    # Prefer latest meaningful user message as the chat card preview.
    latest_user_messages = (
        db.query(Message)
        .filter_by(session_id=session_id, visible=True, role="user")
        .order_by(Message.timestamp.desc())
        .all()
    )

    for message in latest_user_messages:
        normalized = _normalize_preview_text(message.content)
        if normalized:
            return _truncate_preview(normalized)

    # If user has not sent anything yet, keep an explicit new chat label.
    return "New chat"


def summarize_old_messages(session_id: str, db, client, max_history: int):
    all_messages = (
        db.query(Message)
        .filter_by(session_id=session_id, visible=True)
        .order_by(Message.timestamp)
        .all()
    )
    if len(all_messages) <= max_history:
        return None

    early_messages = all_messages[:-max_history]
    prompt = [
        {
            "role": "system",
            "content": "You are summarizing a conversation between an educator and an EDI advisor. Provide a brief summary of the conversation so far.",
        },
        *[{"role": message.role, "content": message.content} for message in early_messages],
    ]
    summary_response = client.chat.completions.create(model="gpt-4.1-mini", messages=prompt)
    return summary_response.choices[0].message.content


def get_chat_history(session_id: str, db, system_prompt: str, max_history: int):
    session = db.query(ChatSession).filter_by(id=session_id).first()
    history = (
        db.query(Message)
        .filter_by(session_id=session_id, visible=True)
        .order_by(Message.timestamp)
        .all()
    )
    messages = [{"role": message.role, "content": message.content} for message in history][-max_history:]

    system_prompt_present = any(
        message["role"] == "system" and system_prompt in message["content"]
        for message in messages
    )

    if not system_prompt_present:
        messages.insert(0, {"role": "system", "content": system_prompt})

    lesson_present = any(
        session.original_lesson.strip()[:100] in message["content"]
        for message in messages
    ) if session and session.original_lesson else False

    if session and session.original_lesson and not lesson_present:
        messages.insert(
            1,
            {
                "role": "user",
                "content": f"The original lesson plan for this conversation is:\n{session.original_lesson}",
            },
        )

    if session and session.summary:
        messages.insert(1, {"role": "system", "content": f"Summary of earlier conversation: {session.summary}"})

    return messages
