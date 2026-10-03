import json
import re
from typing import Dict, Any, List, Optional, Tuple
import httpx
from app.prompts import EXTRACTION_SYSTEM_PROMPT, QUERY_EXPANSION_SYSTEM_PROMPT, REASONING_SYSTEM_PROMPT

OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_OLLAMA_MODEL = "gemma3:4b"


def clean_json_text(text: str) -> str:
    """Removes markdown backticks and trims to JSON boundary."""
    text = text.strip()
    # Strip ```json ... ```
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    # Find outer curly braces or square brackets
    start_brace = text.find("{")
    start_bracket = text.find("[")
    if start_brace != -1 and (start_bracket == -1 or start_brace < start_bracket):
        end = text.rfind("}")
        if end != -1:
            return text[start_brace:end + 1]
    elif start_bracket != -1:
        end = text.rfind("]")
        if end != -1:
            return text[start_bracket:end + 1]
    return text.strip()


async def check_ollama_status() -> Tuple[bool, Optional[str], List[str]]:
    """Checks if Ollama is running and what models are present."""
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("name", "") for m in data.get("models", [])]
                has_gemma = next((m for m in models if "gemma3" in m or "gemma" in m), None)
                return True, (has_gemma or (models[0] if models else None)), models
    except Exception:
        pass
    return False, None, []


# --- Fallback Deterministic Local Engine ---
def deterministic_extract(text_input: str) -> Dict[str, Any]:
    """
    Deterministic rule-based pattern extractor when Ollama/Cloud AI is unavailable.
    Guarantees the system never crashes or errors out.
    """
    text_lower = text_input.lower()
    
    # Infer Device
    device = None
    if any(k in text_lower for k in ["laptop", "notebook", "macbook", "thinkpad"]):
        device = "Laptop"
    elif any(k in text_lower for k in ["desktop", "pc", "tower", "workstation"]):
        device = "Desktop"
    elif any(k in text_lower for k in ["phone", "iphone", "android", "mobile"]):
        device = "Phone"
    elif any(k in text_lower for k in ["router", "modem", "printer", "monitor", "tv"]):
        device = "Hardware Device"

    # Infer OS
    os_name = None
    if "windows 11" in text_lower or "win 11" in text_lower:
        os_name = "Windows 11"
    elif "windows" in text_lower or "win 10" in text_lower:
        os_name = "Windows"
    elif "macos" in text_lower or "mac" in text_lower:
        os_name = "macOS"
    elif "linux" in text_lower or "ubuntu" in text_lower or "debian" in text_lower:
        os_name = "Linux"

    # Infer Subsystem
    subsystem = "General"
    if any(k in text_lower for k in ["wi-fi", "wifi", "network", "ethernet", "internet", "adapter"]):
        subsystem = "Wi-Fi / Network"
    elif any(k in text_lower for k in ["monitor", "display", "screen", "hdmi", "usb-c", "gpu"]):
        subsystem = "Display / Monitor"
    elif any(k in text_lower for k in ["printer", "spooler", "print"]):
        subsystem = "Printer"
    elif any(k in text_lower for k in ["bluetooth", "headphone", "airpods"]):
        subsystem = "Bluetooth"
    elif any(k in text_lower for k in ["git", "merge", "commit", "branch", "npm", "node"]):
        subsystem = "Developer Tools"

    # Infer Situation
    situation = None
    if any(k in text_lower for k in ["after sleep", "woke from sleep", "waking up", "wake"]):
        situation = "After waking from sleep"
    elif any(k in text_lower for k in ["after update", "os update"]):
        situation = "After OS update"
    elif any(k in text_lower for k in ["during gaming", "gaming"]):
        situation = "During gaming"

    # Split into sentences or clauses
    clauses = re.split(r"[.;\n]| then | and then | but ", text_input)
    attempts = []
    step = 1

    for clause in clauses:
        c = clause.strip()
        c_lower = c.lower()
        if not c or len(c) < 5:
            continue
        
        # Check if clause represents an action
        is_action = any(verb in c_lower for verb in [
            "restart", "reboot", "reset", "reinstall", "deleted", "unplug", "replug",
            "changed", "reconnected", "ran", "executed", "updated", "cleared", "tried"
        ])
        
        if is_action:
            outcome = "unknown"
            if any(ok in c_lower for ok in ["worked", "fixed", "came back", "resolved", "started working", "successful"]):
                outcome = "worked"
            elif any(fail in c_lower for fail in ["didn't work", "did not work", "failed", "still", "didn't help", "no luck"]):
                outcome = "failed"
            
            # Clean action summary
            action_clean = re.sub(r"(i |and |then |after that |finally )", "", c, flags=re.IGNORECASE).strip()
            attempts.append({
                "action": action_clean[:100].capitalize(),
                "outcome": outcome,
                "notes": c,
                "step_order": step
            })
            step += 1

    # If no attempts identified by verbs, construct a general one
    if not attempts:
        attempts.append({
            "action": text_input[:80].strip(),
            "outcome": "worked" if any(w in text_lower for w in ["worked", "fixed"]) else "unknown",
            "notes": text_input,
            "step_order": 1
        })

    title = f"{subsystem} issue" if subsystem != "General" else "Troubleshooting incident"
    for word in ["wi-fi", "wifi", "printer", "monitor", "display", "bluetooth", "git"]:
        if word in text_lower:
            title = f"{word.capitalize()} troubleshooting fix"
            break

    return {
        "title": title,
        "problem": text_input[:150].strip(),
        "context": f"{device or 'Device'} running {os_name or 'OS'}",
        "device": device,
        "os": os_name,
        "situation": situation,
        "subsystem": subsystem,
        "attempts": attempts,
        "source": "Local Deterministic Engine (Ollama Offline)"
    }


def deterministic_reasoning(question: str, incidents: List[Any]) -> Dict[str, Any]:
    """Synthesizes historical incident memories into structured answer without LLM."""
    if not incidents:
        return {
            "found": False,
            "summary": "No matching troubleshooting memory found for this problem.",
            "most_recent_fix": None,
            "other_confirmed_fixes": [],
            "previously_tried": [],
            "evidence_note": "No previous records matched your query terms in the database."
        }

    # Extract all worked and failed actions
    confirmed_fixes = []
    failed_attempts = []

    for inc in incidents:
        inc_data = inc.to_dict() if hasattr(inc, "to_dict") else inc
        inc_id = inc_data.get("id")
        inc_title = inc_data.get("title", "")
        inc_date = inc_data.get("created_at")

        for att in inc_data.get("attempts", []):
            if att.get("outcome") == "worked":
                confirmed_fixes.append({
                    "action": att.get("action"),
                    "incident_id": inc_id,
                    "incident_title": inc_title,
                    "date": inc_date,
                    "notes": att.get("notes")
                })
            elif att.get("outcome") == "failed":
                failed_attempts.append({
                    "action": att.get("action"),
                    "outcome_note": f"Last time, this did not resolve the issue in '{inc_title}'",
                    "incident_id": inc_id
                })

    most_recent = confirmed_fixes[0] if confirmed_fixes else None
    others = confirmed_fixes[1:] if len(confirmed_fixes) > 1 else []

    summary_text = ""
    if most_recent:
        summary_text = f"You had this problem before in '{most_recent['incident_title']}'. The confirmed fix was: {most_recent['action']}."
    else:
        summary_text = f"Found {len(incidents)} related incident(s), but no verified fix was logged as successful yet."

    return {
        "found": True,
        "summary": summary_text,
        "most_recent_fix": most_recent,
        "other_confirmed_fixes": others,
        "previously_tried": failed_attempts,
        "evidence_note": f"Matched {len(incidents)} historical troubleshooting record(s) in SQLite FTS5."
    }


# --- Unified Multi-Provider API Dispatcher ---
async def call_llm(
    prompt: str,
    system_prompt: str,
    provider: str = "auto",
    api_key: Optional[str] = None,
    model: Optional[str] = None
) -> Tuple[str, str]:
    """
    Executes non-blocking LLM completion with automatic 3-tier fallback.
    Returns (raw_content, provenance_string).
    """
    # Auto-resolve provider priority:
    # 1. If explicit API key provided, use corresponding provider
    # 2. Else check if local Ollama is active
    # 3. Else fallback to deterministic
    selected_provider = provider
    if provider == "auto":
        if api_key and provider != "ollama":
            # Default to groq/gemini/openai if api_key has characteristic format
            if api_key.startswith("gsk_"):
                selected_provider = "groq"
            elif api_key.startswith("AIza"):
                selected_provider = "gemini"
            elif api_key.startswith("sk-ant-"):
                selected_provider = "claude"
            elif api_key.startswith("sk-"):
                selected_provider = "openai"
            else:
                selected_provider = "mercury"
        else:
            is_ollama, _, _ = await check_ollama_status()
            selected_provider = "ollama" if is_ollama else "fallback"

    # --- TIER 1: Local Ollama ---
    if selected_provider == "ollama":
        try:
            target_model = model or DEFAULT_OLLAMA_MODEL
            async with httpx.AsyncClient(timeout=25.0) as client:
                payload = {
                    "model": target_model,
                    "prompt": f"{system_prompt}\n\nUser Input:\n{prompt}",
                    "stream": False,
                    "format": "json"
                }
                res = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
                if res.status_code == 200:
                    resp_json = res.json()
                    return resp_json.get("response", ""), f"Local Gemma 3 ({target_model} via Ollama)"
        except Exception as e:
            print(f"[Ollama Call Warning] {e}. Falling back...")
            if not api_key:
                selected_provider = "fallback"

    # --- TIER 2: Cloud Providers ---
    if selected_provider in ["groq", "mercury", "openai"] and api_key:
        base_urls = {
            "groq": ("https://api.groq.com/openai/v1", model or "llama-3.3-70b-versatile"),
            "mercury": ("https://api.inceptionlabs.ai/v1", model or "mercury-2.5"),
            "openai": ("https://api.openai.com/v1", model or "gpt-4o-mini")
        }
        base_url, target_model = base_urls[selected_provider]
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ]
                payload = {
                    "model": target_model,
                    "messages": messages,
                    "response_format": {"type": "json_object"}
                }
                res = await client.post(f"{base_url}/chat/completions", headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    return content, f"Cloud API ({selected_provider.capitalize()} - {target_model})"
        except Exception as e:
            print(f"[{selected_provider} Call Error] {e}. Falling back...")

    # --- Google Gemini ---
    if selected_provider == "gemini" and api_key:
        target_model = model or "gemini-2.0-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={api_key}"
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                payload = {
                    "contents": [{"parts": [{"text": f"{system_prompt}\n\nUser Input:\n{prompt}"}]}],
                    "generationConfig": {"responseMimeType": "application/json"}
                }
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["candidates"][0]["content"]["parts"][0]["text"]
                    return content, f"Cloud API (Gemini - {target_model})"
        except Exception as e:
            print(f"[Gemini Call Error] {e}. Falling back...")

    # --- Anthropic Claude ---
    if selected_provider == "claude" and api_key:
        target_model = model or "claude-3-5-sonnet-20241022"
        url = "https://api.anthropic.com/v1/messages"
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                headers = {
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                }
                payload = {
                    "model": target_model,
                    "max_tokens": 1024,
                    "system": system_prompt,
                    "messages": [{"role": "user", "content": prompt}]
                }
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["content"][0]["text"]
                    return content, f"Cloud API (Claude - {target_model})"
        except Exception as e:
            print(f"[Claude Call Error] {e}. Falling back...")

    # --- TIER 3: Local Deterministic Fallback ---
    return "", "Local Deterministic Engine (Ollama Offline)"


# --- Dynamic Model Discovery ---
async def discover_models(provider: str, api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Dynamically queries provider model catalog.
    Eliminates hardcoded model lists so future models work automatically.
    """
    if provider == "ollama":
        connected, active_model, all_models = await check_ollama_status()
        return {
            "provider": "ollama",
            "models": all_models if all_models else [DEFAULT_OLLAMA_MODEL],
            "recommended_model": active_model or DEFAULT_OLLAMA_MODEL,
            "status": "connected" if connected else "offline"
        }

    if provider in ["groq", "mercury", "openai"] and api_key:
        base_urls = {
            "groq": "https://api.groq.com/openai/v1/models",
            "mercury": "https://api.inceptionlabs.ai/v1/models",
            "openai": "https://api.openai.com/v1/models"
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = {"Authorization": f"Bearer {api_key}"}
                res = await client.get(base_urls[provider], headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    raw_models = [m.get("id") for m in data.get("data", [])]
                    # Filter chat/instruct models
                    chat_models = [m for m in raw_models if not any(x in m for x in ["embed", "whisper", "tts", "moderation", "dall-e"])]
                    rec = chat_models[0] if chat_models else "default"
                    return {
                        "provider": provider,
                        "models": chat_models[:15],
                        "recommended_model": rec,
                        "status": "connected"
                    }
        except Exception as e:
            return {"provider": provider, "models": [], "recommended_model": None, "status": f"error: {str(e)}"}

    if provider == "gemini" and api_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name", "").replace("models/", "") for m in data.get("models", [])]
                    chat_models = [m for m in models if "gemini" in m and "embedding" not in m]
                    return {
                        "provider": "gemini",
                        "models": chat_models,
                        "recommended_model": next((m for m in chat_models if "flash" in m), chat_models[0]),
                        "status": "connected"
                    }
        except Exception as e:
            return {"provider": "gemini", "models": [], "recommended_model": None, "status": f"error: {str(e)}"}

    return {
        "provider": provider,
        "models": [],
        "recommended_model": None,
        "status": "api_key_required"
    }


# --- High-Level Application Operations ---
async def extract_incident_from_text(
    text_input: str,
    provider: str = "auto",
    api_key: Optional[str] = None,
    model: Optional[str] = None
) -> Dict[str, Any]:
    """Extracts structured problem, context, and ordered attempts from unstructured text."""
    raw_response, provenance = await call_llm(
        prompt=text_input,
        system_prompt=EXTRACTION_SYSTEM_PROMPT,
        provider=provider,
        api_key=api_key,
        model=model
    )

    if raw_response:
        try:
            clean_str = clean_json_text(raw_response)
            parsed = json.loads(clean_str)
            parsed["source"] = provenance
            return parsed
        except Exception as e:
            print(f"[Extraction JSON Parse Error] {e}. Falling back to deterministic engine...")

    # Deterministic fallback
    result = deterministic_extract(text_input)
    result["source"] = provenance
    return result


async def reason_from_memories(
    question: str,
    incidents: List[Any],
    provider: str = "auto",
    api_key: Optional[str] = None,
    model: Optional[str] = None
) -> Tuple[Dict[str, Any], str]:
    """Synthesizes historical memories into an evidence-based diagnosis."""
    if not incidents:
        return deterministic_reasoning(question, []), "No records"

    # Format memories into structured text block
    memories_text = []
    for inc in incidents:
        data = inc.to_dict() if hasattr(inc, "to_dict") else inc
        att_lines = []
        for a in data.get("attempts", []):
            mark = "✓ WORKED" if a.get("outcome") == "worked" else ("✕ FAILED" if a.get("outcome") == "failed" else "? UNKNOWN")
            att_lines.append(f"  - {mark}: {a.get('action')} (Notes: {a.get('notes') or 'none'})")
        
        memories_text.append(f"""
Incident #{data.get('id')}: {data.get('title')}
Problem: {data.get('problem')}
Context: {data.get('context') or 'Not specified'} (Device: {data.get('device')}, OS: {data.get('os')}, Situation: {data.get('situation')})
Resolved Date: {data.get('created_at')}
Attempts:
{chr(10).join(att_lines)}
""")

    formatted_memories = "\n---\n".join(memories_text)
    full_prompt = REASONING_SYSTEM_PROMPT.replace("{QUESTION}", question).replace("{MEMORIES}", formatted_memories)

    raw_response, provenance = await call_llm(
        prompt=f"Question: {question}",
        system_prompt=full_prompt,
        provider=provider,
        api_key=api_key,
        model=model
    )

    if raw_response:
        try:
            clean_str = clean_json_text(raw_response)
            parsed = json.loads(clean_str)
            return parsed, provenance
        except Exception as e:
            print(f"[Reasoning JSON Parse Error] {e}. Using deterministic synthesizer...")

    fallback_data = deterministic_reasoning(question, incidents)
    return fallback_data, provenance
