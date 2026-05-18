# app/db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load .env only for local/dev. Under systemd your /etc/backend.env
# is already in the process environment, so this is harmless.
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_NAME = os.getenv("DB_NAME", "edi_chatbot_local")
DB_USER = os.getenv("DB_USER", "edi_chatbot_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "local")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_SOCKET = os.getenv("DB_SOCKET")  # e.g. /var/run/mysqld/mysqld.sock

# Build a robust MySQL URL (prefer socket if provided)
if DB_SOCKET:
    DATABASE_URL = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@localhost/{DB_NAME}"
        f"?charset=utf8mb4&unix_socket={DB_SOCKET}"
    )
else:
    DATABASE_URL = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        f"?charset=utf8mb4"
    )

# IMPORTANT: pre_ping + recycle prevent "MySQL server has gone away" (2006)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,        # ping connection before use; drops dead conns
    pool_recycle=1800,         # recycle connections every 30 minutes
    pool_size=10,              # tune as needed
    max_overflow=20,
    pool_timeout=30,
    connect_args={"connect_timeout": 10},
    # echo=True,               # uncomment for SQL debug
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# FastAPI dependency example
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
