from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


# --- Attempt Schemas ---
class AttemptBase(BaseModel):
    action: str
    outcome: str = Field(default="unknown", description="'worked', 'failed', or 'unknown'")
    notes: Optional[str] = None
    step_order: int = 1


class AttemptCreate(AttemptBase):
    pass


class AttemptResponse(AttemptBase):
    id: int
    incident_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Incident Schemas ---
class IncidentBase(BaseModel):
    title: str
    problem: str
    context: Optional[str] = None
    device: Optional[str] = None
    os: Optional[str] = None
    situation: Optional[str] = None
    subsystem: Optional[str] = None


class IncidentCreate(IncidentBase):
    attempts: List[AttemptCreate] = Field(default_factory=list)


class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    problem: Optional[str] = None
    context: Optional[str] = None
    device: Optional[str] = None
    os: Optional[str] = None
    situation: Optional[str] = None
    subsystem: Optional[str] = None
    attempts: Optional[List[AttemptCreate]] = None


class IncidentResponse(IncidentBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    attempts: List[AttemptResponse] = Field(default_factory=list)
    confirmed_fix: Optional[str] = None
    failed_attempts: List[str] = Field(default_factory=list)

    class Config:
        from_attributes = True


# --- Extraction Schemas ---
class ExtractRequest(BaseModel):
    text: str
    provider: Optional[str] = "auto"
    api_key: Optional[str] = None
    model: Optional[str] = None


class ExtractResponse(BaseModel):
    title: str
    problem: str
    context: Optional[str] = None
    device: Optional[str] = None
    os: Optional[str] = None
    situation: Optional[str] = None
    subsystem: Optional[str] = None
    attempts: List[AttemptCreate] = Field(default_factory=list)
    source: str = "Local Gemma 3 4B"


# --- Search Schemas ---
class SearchRequest(BaseModel):
    query: str
    provider: Optional[str] = "auto"  # 'auto', 'ollama', 'gemini', 'groq', 'mercury', 'openai', 'claude', 'fallback'
    api_key: Optional[str] = None
    model: Optional[str] = None


class EvidenceTrailItem(BaseModel):
    incident_id: int
    title: str
    date_resolved: Optional[str] = None
    matched_keywords: List[str] = Field(default_factory=list)
    context_tags: Dict[str, Optional[str]] = Field(default_factory=dict)
    provenance: str = "SQLite FTS5 BM25"


class SearchResponse(BaseModel):
    found: bool
    message: str
    most_recent_fix: Optional[Dict[str, Any]] = None
    other_confirmed_fixes: List[Dict[str, Any]] = Field(default_factory=list)
    previously_tried: List[Dict[str, Any]] = Field(default_factory=list)
    evidence_trail: List[EvidenceTrailItem] = Field(default_factory=list)
    incidents: List[IncidentResponse] = Field(default_factory=list)
    ai_synthesis: Optional[str] = None
    provenance: str = "Local Gemma 3 4B (Ollama)"


# --- Dynamic Models Discovery Schemas ---
class ModelsRequest(BaseModel):
    provider: str
    api_key: Optional[str] = None


class ModelsResponse(BaseModel):
    provider: str
    models: List[str] = Field(default_factory=list)
    recommended_model: Optional[str] = None
    status: str = "ok"


# --- Health & Diagnostic Schemas ---
class HealthResponse(BaseModel):
    status: str = "healthy"
    ollama_connected: bool = False
    ollama_model: Optional[str] = None
    database_connected: bool = True
    incidents_count: int = 0
