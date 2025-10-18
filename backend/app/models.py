from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Boolean
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(String(36), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    original_lesson = Column(Text)
    updated_lesson = Column(Text)
    summary = Column(Text)  
    file_name = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    file_type = Column(String, nullable=True)

class Message(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("chat_sessions.id"))
    role = Column(String(10))
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    visible = Column(Boolean, default=True)
    file_link = Column(String(200), nullable=True)

class Feedback(Base):
    __tablename__ = "chat_feedback"
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("chat_sessions.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    name = Column(String(50))
    feedback = Column(Text)
    