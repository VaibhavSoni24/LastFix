from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import get_db, init_db
from app.models import Incident, Attempt
from app.schemas import (
    IncidentCreate, IncidentResponse, IncidentUpdate,
    ExtractRequest, ExtractResponse,
    SearchRequest, SearchResponse, EvidenceTrailItem,
    ModelsResponse, HealthResponse
)
from app.search import search_incidents_fts
from app.ai import (
    extract_incident_from_text,
    reason_from_memories,
    discover_models,
    check_ollama_status
)
from app.seed import seed_database

app = FastAPI(
    title="LastFix API",
    description="High-precision personal troubleshooting memory system powered by local Gemma 3 4B & SQLite FTS5.",
    version="1.0.0"
)

# CORS Setup for Vite / Local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """Initializes SQLite tables and FTS5 triggers on server launch."""
    init_db()


# --- Health & Diagnostics ---
@app.get("/api/health", response_model=HealthResponse)
async def health_check(db: Session = Depends(get_db)):
    ollama_conn, active_model, _ = await check_ollama_status()
    inc_count = db.query(Incident).count()
    return HealthResponse(
        status="healthy",
        ollama_connected=ollama_conn,
        ollama_model=active_model,
        database_connected=True,
        incidents_count=inc_count
    )


# --- Extraction (Preview without Saving) ---
@app.post("/api/incidents/extract", response_model=ExtractResponse)
async def extract_incident(req: ExtractRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    
    extracted = await extract_incident_from_text(
        text_input=req.text,
        provider=req.provider or "auto",
        api_key=req.api_key,
        model=req.model
    )
    return ExtractResponse(**extracted)


# --- Incidents CRUD ---
@app.post("/api/incidents", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(incident_in: IncidentCreate, db: Session = Depends(get_db)):
    incident = Incident(
        title=incident_in.title,
        problem=incident_in.problem,
        context=incident_in.context,
        device=incident_in.device,
        os=incident_in.os,
        situation=incident_in.situation,
        subsystem=incident_in.subsystem
    )
    db.add(incident)
    db.flush()

    for idx, att_data in enumerate(incident_in.attempts, start=1):
        att = Attempt(
            incident_id=incident.id,
            action=att_data.action,
            outcome=att_data.outcome,
            notes=att_data.notes,
            step_order=att_data.step_order or idx
        )
        db.add(att)

    db.commit()
    db.refresh(incident)
    return IncidentResponse.model_validate(incident)


@app.get("/api/incidents", response_model=List[IncidentResponse])
def list_incidents(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    subsystem: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if subsystem:
        query = query.filter(Incident.subsystem == subsystem)
    incidents = query.order_by(Incident.created_at.desc()).offset(skip).limit(limit).all()
    return [IncidentResponse.model_validate(inc) for inc in incidents]


@app.get("/api/incidents/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return IncidentResponse.model_validate(incident)


@app.delete("/api/incidents/{incident_id}")
def delete_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    db.delete(incident)
    db.commit()
    return {"status": "deleted", "id": incident_id}


# --- Search & Evidence-Based Reasoning ---
@app.post("/api/search", response_model=SearchResponse)
async def search_memories(req: SearchRequest, db: Session = Depends(get_db)):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")

    # 1. Retrieve candidate incidents using SQLite FTS5 BM25 ranking
    matched_tuples = search_incidents_fts(db, req.query, limit=5)
    matched_incidents = [t[0] for t in matched_tuples]

    # 2. Build Evidence Trail items ("Why am I seeing this?")
    evidence_trail: List[EvidenceTrailItem] = []
    for inc, matched_words in matched_tuples:
        evidence_trail.append(EvidenceTrailItem(
            incident_id=inc.id,
            title=inc.title,
            date_resolved=inc.created_at.strftime("%b %d, %Y") if inc.created_at else None,
            matched_keywords=matched_words,
            context_tags={
                "device": inc.device,
                "os": inc.os,
                "situation": inc.situation,
                "subsystem": inc.subsystem
            },
            provenance="SQLite FTS5 BM25 Match"
        ))

    # 3. Memory Reasoning Synthesis
    reasoning_data, provenance = await reason_from_memories(
        question=req.query,
        incidents=matched_incidents,
        provider=req.provider or "auto",
        api_key=req.api_key,
        model=req.model
    )

    return SearchResponse(
        found=reasoning_data.get("found", len(matched_incidents) > 0),
        message=reasoning_data.get("summary", ""),
        most_recent_fix=reasoning_data.get("most_recent_fix"),
        other_confirmed_fixes=reasoning_data.get("other_confirmed_fixes", []),
        previously_tried=reasoning_data.get("previously_tried", []),
        evidence_trail=evidence_trail,
        incidents=[IncidentResponse.model_validate(inc) for inc in matched_incidents],
        ai_synthesis=reasoning_data.get("summary"),
        provenance=provenance
    )


# --- Dynamic Model Discovery ---
@app.get("/api/models", response_model=ModelsResponse)
async def get_models(provider: str = Query(...), api_key: Optional[str] = None):
    result = await discover_models(provider=provider, api_key=api_key)
    return ModelsResponse(
        provider=result.get("provider", provider),
        models=result.get("models", []),
        recommended_model=result.get("recommended_model"),
        status=result.get("status", "ok")
    )


# --- Seed Demo Incidents (One-Click) ---
@app.post("/api/seed")
def seed_data(db: Session = Depends(get_db)):
    count = seed_database(db)
    return {"status": "seeded", "count": count, "message": f"Successfully loaded {count} demo incidents"}
