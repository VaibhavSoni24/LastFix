import re
from typing import List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models import Incident


def clean_fts_query(query_str: str) -> str:
    """
    Sanitizes user input into a safe FTS5 query with prefix matching.
    Removes syntax characters like *, :, ^, ", (, ), AND, OR, NOT.
    """
    words = re.findall(r"\w+", query_str.lower())
    if not words:
        return ""
    # Filter common stop words
    stop_words = {"the", "a", "an", "is", "was", "my", "to", "in", "it", "and", "or", "did", "how", "what", "again"}
    meaningful = [w for w in words if w not in stop_words and len(w) > 1]
    if not meaningful:
        meaningful = words

    # FTS5 OR search with prefix wildcards
    fts_terms = [f"{w}*" for w in meaningful]
    return " OR ".join(fts_terms)


def search_incidents_fts(db: Session, query_str: str, limit: int = 5) -> List[Tuple[Incident, List[str]]]:
    """
    Queries incidents_fts using SQLite FTS5 with BM25 ranking.
    Returns a list of tuples: (Incident, matched_keywords).
    """
    fts_query = clean_fts_query(query_str)
    query_words = set(re.findall(r"\w+", query_str.lower()))

    results: List[Tuple[Incident, List[str]]] = []

    if fts_query:
        try:
            # Query FTS5 table ordered by BM25 relevance rank
            sql = text("""
                SELECT id, bm25(incidents_fts) as rank
                FROM incidents_fts
                WHERE incidents_fts MATCH :query
                ORDER BY rank
                LIMIT :limit
            """)
            rows = db.execute(sql, {"query": fts_query, "limit": limit}).fetchall()

            for row in rows:
                incident_id = row[0]
                incident = db.query(Incident).filter(Incident.id == incident_id).first()
                if incident:
                    # Find matched keywords
                    haystack = f"{incident.title} {incident.problem} {incident.context or ''} {incident.subsystem or ''} {incident.device or ''} {incident.os or ''} {incident.situation or ''}".lower()
                    matched = [w for w in query_words if w in haystack and len(w) > 2]
                    results.append((incident, matched))
        except Exception as e:
            # If FTS5 errors for any syntax reason, gracefully log and fall through to LIKE
            print(f"[FTS5 Search Notice] FTS5 query '{fts_query}' error: {e}. Falling back to standard search.")

    # Fallback to LIKE matching if FTS5 returned 0 results
    if not results and query_words:
        like_filters = []
        for word in list(query_words)[:4]:
            if len(word) > 2:
                like_filters.append(f"%{word}%")

        if like_filters:
            matched_incidents = (
                db.query(Incident)
                .filter(
                    Incident.title.ilike(like_filters[0])
                    | Incident.problem.ilike(like_filters[0])
                    | Incident.subsystem.ilike(like_filters[0])
                )
                .limit(limit)
                .all()
            )
            for inc in matched_incidents:
                haystack = f"{inc.title} {inc.problem} {inc.subsystem or ''}".lower()
                matched = [w for w in query_words if w in haystack]
                results.append((inc, matched))

    return results
