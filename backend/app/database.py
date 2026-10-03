import os
import sqlite3
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
os.makedirs(DATABASE_DIR, exist_ok=True)

DATABASE_URL = f"sqlite:///{os.path.join(DATABASE_DIR, 'lastfix.db')}"

# SQLite specific connect args for thread safety
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency to yield database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_fts5(connection):
    """
    Initializes SQLite FTS5 virtual table for lightning-fast BM25 lexical search.
    Creates triggers to keep the FTS5 index synchronized with the incidents table.
    """
    cursor = connection.cursor()
    try:
        # Create FTS5 table
        cursor.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS incidents_fts USING fts5(
                id UNINDEXED,
                title,
                problem,
                context,
                device,
                os,
                situation,
                subsystem,
                tokenize = 'porter unicode61'
            );
        """)

        # Trigger for INSERT
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS incidents_ai AFTER INSERT ON incidents BEGIN
                INSERT INTO incidents_fts(id, title, problem, context, device, os, situation, subsystem)
                VALUES (new.id, new.title, new.problem, new.context, new.device, new.os, new.situation, new.subsystem);
            END;
        """)

        # Trigger for DELETE
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS incidents_ad AFTER DELETE ON incidents BEGIN
                DELETE FROM incidents_fts WHERE id = old.id;
            END;
        """)

        # Trigger for UPDATE
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS incidents_au AFTER UPDATE ON incidents BEGIN
                DELETE FROM incidents_fts WHERE id = old.id;
                INSERT INTO incidents_fts(id, title, problem, context, device, os, situation, subsystem)
                VALUES (new.id, new.title, new.problem, new.context, new.device, new.os, new.situation, new.subsystem);
            END;
        """)
    finally:
        cursor.close()


def init_db():
    """Initializes tables and FTS5 indexes."""
    from app import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    
    # Run FTS5 setup using raw sqlite3 connection
    raw_conn = sqlite3.connect(os.path.join(DATABASE_DIR, "lastfix.db"))
    try:
        init_fts5(raw_conn)
        raw_conn.commit()
    finally:
        raw_conn.close()
