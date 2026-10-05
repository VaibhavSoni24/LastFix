# LastFix 🛠️

> **"LastFix doesn't tell you how to fix a problem. It remembers how you fixed it."**  
> *A high-precision personal troubleshooting memory system powered by local open-weight AI (Gemma 3 4B via Ollama) and an ultra-modern, dark-themed, craft-focused WebGL/Motion frontend.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026-FF8800.svg)](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)
[![Demo Video](https://img.shields.io/badge/Demo%20Video-YouTube-FF0000.svg)](https://youtu.be/QkWXPwysdhc)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Gemma%203%204B-4285F4.svg)](https://ollama.com/library/gemma3)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20SQLite%20FTS5-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-61DAFB.svg)](https://vitejs.dev)

---

## 📺 Live Demo Walkthrough

[![LastFix Demo Video](https://img.youtube.com/vi/QkWXPwysdhc/maxresdefault.jpg)](https://youtu.be/QkWXPwysdhc)

> 🔗 **Watch the full walkthrough on YouTube**: [https://youtu.be/QkWXPwysdhc](https://youtu.be/QkWXPwysdhc)

---

## 💡 The Human Story: Built for Tilak & Saumya

For the **Hacktoberfest 2026 "Build for a Friend" Weekend Challenge**, LastFix was created to solve real, recurring headaches for two people:

- **Tilak Khatoria (Friend)**: Constantly plagued by laptop display detection glitches over USB-C/HDMI and recurring Git merge conflict cascades. Every time it happens, he spends 15–20 minutes fruitlessly retrying reboot sequences that never worked in the past.
- **Saumya Soni (Sister)**: Frequently encounters Wi-Fi disappearing after Windows 11 wakes from sleep and printer spooler connection drops. Every time, she repeats the same failed reboot attempts before finally remembering that resetting the network adapter was the only thing that worked.

LastFix is built for them: when technology fails, instead of starting from zero or wading through generic internet search results, they open LastFix and immediately recover what *they* actually did to fix it.

---

## ⚡ The Problem: Why Traditional Troubleshooting Fails

1. **Generic AI & Search Hallucinations**: Standard search engines return SEO-spam articles with 15 generic tips. Generic AI chatbots spit out encyclopedic checklists that don't reflect your specific OS version, hardware revision, or home network topology.
2. **Repeating Failed Steps**: People spend 20 minutes restarting laptops, replugging cables, and clearing caches—actions that *already failed* the last three times they had the problem.

---

## 🧠 The LastFix Difference

LastFix records your empirical troubleshooting history:
- **Incident & Inferred Context**: Automatically extracts `device`, `os`, `situation`, and `subsystem` without tedious manual forms.
- **Evidence-Based "Previously Tried"**: Empirically distinguishes actions that failed in past incidents from the proven fix, warning you:  
  `✕ Restart laptop — Failed in this incident`  
  *“Last time, restarting did not resolve the issue.”*
- **Confirmed Fix**: Highlights the verified intervention that solved the problem (`CONFIRMED FIX`).
- **Evidence Trail ("Why am I seeing this?")**: Complete transparency showing matched keywords and contextual attributes.
- **Multi-Fix Synthesizer**: When multiple past incidents match, displays both the most recent confirmed fix and historical solutions.

---

## 🏛️ High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LASTFIX CLIENT (Vite + React)                   │
│                         (100% Self-Contained Offline)                  │
│                                                                        │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────┐   │
│   │ Smoke Shader Canvas │  │  Liquid Metal Logo  │  │  Lenis Scroll│   │
│   │ (WebGL / Three.js)  │  │ (Canvas/Shader FX)  │  │  & Motion    │   │
│   └─────────────────────┘  └─────────────────────┘  └──────────────┘   │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Direct Page Layout (Minimal Cards, Full-Width Edge Grids)       │   │
│   │ - AI Engine Status: ● Gemma 3 4B / Fallback Provenance Badge   │   │
│   │ - Hero / Interactive Liquid Logo & Tagline                     │   │
│   │ - "Ask LastFix" Search + Evidence-Based Diagnosis Engine       │   │
│   │ - "Why am I seeing this?" Expandable Evidence Trail Drawer     │   │
│   │ - Multi-Fix Synthesizer (Most Recent + Historical Fixes)       │   │
│   │ - "Log a Fix" Natural Language Extraction & Verification Modal │   │
│   │ - "Fix Memory Timeline" & Incident History                     │   │
│   │ - Empty State Banner: [Load Demo Memories] (disappears on data)│   │
│   │ - Audio Micro-Feedback (UI SFX) & Driver.js Product Tour       │   │
│   └────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Async REST API (httpx / JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             FASTAPI ASYNCHRONOUS BACKEND (Python 3.10+)                │
│                                                                        │
│   ┌─────────────────┐   ┌──────────────────┐   ┌───────────────────┐   │
│   │  API Endpoints  │   │  FTS5 Search     │   │  Async AI Engine  │   │
│   │  /incidents     │   │  Full-Text Query │   │  httpx.AsyncClient│   │
│   │  /search        │   │  BM25 Ranking    │   │  Gemma / Multi-API│   │
│   └────────┬────────┘   └────────┬─────────┘   └─────────┬─────────┘   │
└────────────┼─────────────────────┼───────────────────────┼─────────────┘
             │                     │                       │
             ▼                     ▼                       ▼
    ┌─────────────────┐   ┌──────────────────┐   ┌───────────────────┐
    │  SQLite (FTS5)  │   │ Incident History │   │  Ollama Engine    │
    │  lastfix.db     │   │ & Attempt Tables │   │  Gemma 3 4B Model │
    └─────────────────┘   └──────────────────┘   └───────────────────┘
```

---

## 🔒 Local-First, Privacy & True Offline Resilience

- **Personal Data Stays on Your Machine**: Troubleshooting logs contain sensitive environment details (IP addresses, hardware configs, private app names). Running local Gemma 3 4B via Ollama guarantees your data never leaves your device.
- **100% Self-Contained Offline**: System font stacks, zero Google Fonts or external CDN links, zero remote images, and zero third-party telemetry. Works completely disconnected from the internet.
- **Hybrid 3-Tier Fallback**:
  1. *Tier 1 (Preferred)*: Local Gemma 3 4B via Ollama (`http://localhost:11434`).
  2. *Tier 2 (Cloud Fallback)*: Dynamic auto-discovery for user keys (Gemini, Groq, Inception Mercury, OpenAI, Claude).
  3. *Tier 3 (Local Deterministic)*: Built-in deterministic pattern-matching engine activating when Ollama is offline.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python**: 3.10+
- **Node.js**: 18+ (tested on Node 24)
- **Ollama** (for local LLM inference): [ollama.com](https://ollama.com)

### 2. Run Gemma 3 4B Locally
```bash
ollama run gemma3:4b
```
*(If Ollama is not installed or offline, LastFix will notify you and seamlessly utilize your cloud API key or local deterministic fallback engine).*

### 3. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend runs at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

Author: **Vaibhav Soni** ([@VaibhavSoni24](https://github.com/VaibhavSoni24))
