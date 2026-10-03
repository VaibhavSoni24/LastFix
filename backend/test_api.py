import sys
import os
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.database import init_db

client = TestClient(app)


def test_full_pipeline():
    print("\n--- Starting LastFix Automated Backend Tests ---")

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health = res.json()
    print("[OK] Health Check Passed:", health)

    # 2. Extract Incident
    sample_text = "My external 4K monitor was not detected on my macOS laptop. Changing the HDMI cable failed, then reconnecting display adapter worked."
    res = client.post("/api/incidents/extract", json={"text": sample_text, "provider": "fallback"})
    assert res.status_code == 200, f"Extraction failed: {res.text}"
    extracted = res.json()
    assert len(extracted["attempts"]) >= 2, "Expected at least 2 extracted attempts"
    print("[OK] Extraction Passed:", extracted["title"], f"({len(extracted['attempts'])} attempts)")

    # 3. Create Incident
    payload = {
        "title": extracted["title"],
        "problem": extracted["problem"],
        "context": extracted["context"],
        "device": extracted["device"],
        "os": extracted["os"],
        "situation": extracted["situation"],
        "subsystem": extracted["subsystem"],
        "attempts": extracted["attempts"]
    }
    res = client.post("/api/incidents", json=payload)
    assert res.status_code == 201, f"Create incident failed: {res.text}"
    created = res.json()
    incident_id = created["id"]
    print(f"[OK] Incident Created with ID #{incident_id}:", created["title"])

    # 4. Search Incident & Verify Evidence Trail
    search_res = client.post("/api/search", json={"query": "monitor not detected", "provider": "fallback"})
    assert search_res.status_code == 200, f"Search failed: {search_res.text}"
    search_data = search_res.json()
    assert search_data["found"] is True, "Expected incident to be found"
    assert len(search_data["evidence_trail"]) > 0, "Expected evidence trail to be populated"
    print("[OK] Search & Evidence Trail Passed:")
    print("   Message:", search_data["message"])
    print("   Evidence Trail items:", len(search_data["evidence_trail"]))
    print("   Provenance:", search_data["provenance"])

    # 5. Test Models Discovery Endpoint
    res = client.get("/api/models?provider=ollama")
    assert res.status_code == 200
    models_info = res.json()
    print("[OK] Models Endpoint Passed:", models_info["provider"], models_info["status"])

    # 6. Test Seed Endpoint
    res = client.post("/api/seed")
    assert res.status_code == 200
    seed_info = res.json()
    print("[OK] Seed Endpoint Passed:", seed_info["message"])

    # 7. Search Seeded Data (Tilak & Saumya's issues)
    res_wifi = client.post("/api/search", json={"query": "Wi-Fi disappeared after sleep", "provider": "fallback"})
    assert res_wifi.status_code == 200
    wifi_data = res_wifi.json()
    assert wifi_data["found"] is True
    assert wifi_data["most_recent_fix"] is not None
    print("[OK] Tilak/Saumya Seed Search (Wi-Fi) Passed. Confirmed Fix:", wifi_data["most_recent_fix"]["action"])

    # 8. Delete Created Test Incident
    del_res = client.delete(f"/api/incidents/{incident_id}")
    assert del_res.status_code == 200
    print(f"[OK] Incident #{incident_id} Cleanly Deleted.")

    print("\nALL LASTFIX BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY!\n")


if __name__ == "__main__":
    test_full_pipeline()
