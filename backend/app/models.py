from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Boolean
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    name = Column(String(100))
    email = Column(String(100))
    institution = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(String(36), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    original_lesson = Column(Text)
    updated_lesson = Column(Text)
    summary = Column(Text)  
    file_name = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    file_type = Column(String, nullable=True)
    suggested_edits = Column(Text, nullable=True)
    working_file_name = Column(String, nullable=True)
    working_file_path = Column(String, nullable=True)
    working_file_type = Column(String, nullable=True)
    

class Message(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("chat_sessions.id"))
    role = Column(String(10))
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    visible = Column(Boolean, default=True)
    file_link = Column(String(200), nullable=True)

class SupportingDocument(Base):
    __tablename__ = "supporting_documents"
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("chat_sessions.id"))
    document_name = Column(String(200), nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class SupportingDocumentChunk(Base):
    __tablename__ = "supporting_document_chunks"
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("chat_sessions.id"), nullable=False)
    supporting_document_id = Column(Integer, ForeignKey("supporting_documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    content_lower = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class SupportingDocumentChunkVector(Base):
    __tablename__ = "supporting_document_chunk_vectors"
    id = Column(Integer, primary_key=True, autoincrement=True)
    chunk_id = Column(Integer, ForeignKey("supporting_document_chunks.id"), nullable=False)
    session_id = Column(String(36), ForeignKey("chat_sessions.id"), nullable=False)
    supporting_document_id = Column(Integer, ForeignKey("supporting_documents.id"), nullable=False)
    embedding_model = Column(String(100), nullable=False)
    embedding_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Feedback(Base):
    __tablename__ = "chat_feedback"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(String(36), ForeignKey("chat_sessions.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    feedback = Column(Text)
    