from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    problem = Column(Text, nullable=False)
    context = Column(Text, nullable=True)
    device = Column(String(100), nullable=True)
    os = Column(String(100), nullable=True)
    situation = Column(String(255), nullable=True)
    subsystem = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    attempts = relationship(
        "Attempt",
        back_populates="incident",
        cascade="all, delete-orphan",
        order_by="Attempt.step_order"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "problem": self.problem,
            "context": self.context,
            "device": self.device,
            "os": self.os,
            "situation": self.situation,
            "subsystem": self.subsystem,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "attempts": [a.to_dict() for a in self.attempts],
            "confirmed_fix": next((a.action for a in self.attempts if a.outcome == "worked"), None),
            "failed_attempts": [a.action for a in self.attempts if a.outcome == "failed"]
        }


class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    action = Column(Text, nullable=False)
    outcome = Column(String(50), nullable=False, default="unknown")  # 'worked', 'failed', 'unknown'
    notes = Column(Text, nullable=True)
    step_order = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    incident = relationship("Incident", back_populates="attempts")

    def to_dict(self):
        return {
            "id": self.id,
            "incident_id": self.incident_id,
            "action": self.action,
            "outcome": self.outcome,
            "notes": self.notes,
            "step_order": self.step_order,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
