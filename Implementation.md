# LastFix — Master Implementation & Architectural Blueprint

> **"You fixed it before. You just forgot how."**  
> *A high-precision personal troubleshooting memory system powered by local open-weight AI (Gemma 3 4B via Ollama) and an ultra-modern, dark-themed, craft-focused WebGL/Motion frontend.*

---

## 1. Project Overview & Complete `convo.txt` Summary

### 1.1 Context & Hacktoberfest 2026 Genesis
- **Event**: Hacktoberfest 2026 Open-Source AI Weekend Challenge ("Build for a Friend") hosted on the DEV Community in partnership with Google DeepMind (Gemma), Render, TabPFN, DigitalOcean, MongoDB Atlas, Sentry, and others.
- **Submission Deadline**: Monday, October 5, 2026 at 6:59 AM UTC (**12:29 PM IST**).
- **Core Requirements**:
  1. Brand-new project built from scratch during the challenge window.
  2. Open-source / open-weight AI at the core (Gemma 3 4B via local Ollama inference).
  3. Solves a genuine, tangible problem for a friend, family member, or colleague.
  4. Working demo: high-resolution screen-recorded walkthrough or live deployment.
  5. Public GitHub repository with clean history, structured documentation, and open source ethos.
  6. Comprehensive DEV Community article written using the official template + `#hf26challenge`, articulating why open-source and local AI matters (privacy, offline resilience, sovereignty).

### 1.2 The Core Problem: Why Traditional Solutions Fail
Every person constantly encounters friction with technology, tools, and everyday systems:
- *"My laptop Wi-Fi disappeared after sleep. What did I do last month to fix it?"*
- *"My second monitor isn't detected over USB-C. Which display setting or cable sequence worked?"*
- *"My printer went offline in Windows. Did restarting work, or did I have to delete the port?"*
- *"Which specific command resolved that npm peer dependency crash?"*

When this happens, people make two critical errors:
1. **They search Google or ask generic AI bots**: Google returns SEO-spam articles with 15 generic tips. Generic AI chatbots hallucinate or spit out long, generic lists of troubleshooting steps that don't reflect the user's specific operating system, hardware, or past experience.
2. **They repeat failed steps**: They spend 20 minutes restarting the laptop, replugging cables, and clearing caches—actions that *already failed* the last three times they had this exact problem.

### 1.3 The LastFix Solution
**LastFix is NOT a generic troubleshooting chatbot.** It is a **Personal Troubleshooting Memory System**. It records:
- **The Incident**: What broke and when.
- **The Attempts Timeline**: Every action taken, explicitly cataloged as `worked`, `failed`, or `unknown`.
- **The DO NOT REPEAT Engine**: Prominently warns the user against retrying actions that previously failed.
- **The Confirmed Fix**: The exact intervention that actually resolved the issue.

### 1.4 Why Local Open-Weight AI (Gemma 3 4B)?
- **Privacy & Data Sovereignty**: Troubleshooting histories contain sensitive personal telemetry—internal IP addresses, device serials, company software names, home router settings, and personal habits. Sending this to closed cloud APIs is a privacy violation.
- **Offline Reliability**: When your Wi-Fi, Ethernet, or modem is broken, cloud AI assistants are unreachable. A local AI running via Ollama on localhost works completely offline.
- **Precise 3-Stage AI Role**:
  1. *Memory Extraction*: Converts natural language ("My Wi-Fi vanished, reboot failed, reset adapter fixed it") into strictly typed JSON incidents and attempts.
  2. *Query Understanding*: Expands colloquial problem descriptions ("screen is blank") into hardware/OS search terms (`monitor`, `display`, `HDMI`, `DP`, `graphics`).
  3. *Memory Reasoning*: Synthesizes retrieved historical memories, evaluates confidence, flags previous failures under "DO NOT REPEAT", and presents the proven fix.

---

## 2. High-Level Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LASTFIX CLIENT (Vite + React)                   │
│                                                                        │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────┐   │
│   │ Smoke Shader Canvas │  │  Liquid Metal Logo  │  │  Lenis Scroll│   │
│   │ (WebGL / Three.js)  │  │ (Canvas/Shader FX)  │  │  & Motion    │   │
│   └─────────────────────┘  └─────────────────────┘  └──────────────┘   │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Direct Page Layout (Minimal Cards, Full-Width Edge Grids)       │   │
│   │ - Hero / Interactive Liquid Logo & Tagline                     │   │
│   │ - "Ask LastFix" Search + "DO NOT REPEAT" Diagnostic Engine     │   │
│   │ - "Log a Fix" Natural Language Extraction & Verification Modal │   │
│   │ - "Fix Memory Timeline" & Incident History                     │   │
│   │ - Audio Micro-Feedback (UI SFX) & Driver.js Product Tour       │   │
│   └────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API (JSON / CORS enabled)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND (Python 3.10+)                      │
│                                                                        │
│   ┌─────────────────┐   ┌──────────────────┐   ┌───────────────────┐   │
│   │  API Endpoints  │   │  FTS5 Search     │   │  AI Orchestration │   │
│   │  /incidents     │   │  Full-Text Query │   │  Prompts & Parser │   │
│   │  /search        │   │  BM25 Ranking    │   │  Structured JSON  │   │
│   └────────┬────────┘   └────────┬─────────┘   └─────────┬─────────┘   │
└────────────┼─────────────────────┼───────────────────────┼─────────────┘
             │                     │                       │
             ▼                     ▼                       ▼
    ┌─────────────────┐   ┌──────────────────┐   ┌───────────────────┐
    │  SQLite (FTS5)  │   │ Incident History │   │  Ollama Engine    │
    │  lastfix.db     │   │ & Attempt Tables │   │  Gemma 3 4B Model │
    └─────────────────┘   └──────────────────┘   └───────────────────┘
```

### 2.1 Backend Specifications
- **Framework**: FastAPI (Asynchronous Python 3.10+)
- **Server**: Uvicorn ASGI
- **Database**: SQLite 3 with native FTS5 (Full-Text Search 5) virtual tables for lightning-fast lexical search. Database starts empty with an instant 'Load Demo Seed Data' button in the UI.
- **ORM / Schemas**: SQLAlchemy 2.0+ (declarative models) & Pydantic v2 (data validation and strict JSON contracts).
- **AI Engine (Hybrid Dynamic Architecture)**:
  - **Local Ollama**: Local Gemma 3 4B (`gemma3:4b`) auto-detected at `http://localhost:11434`.
  - **Multi-Cloud API Key Support**: In-app secure settings allowing user-provided API keys for:
    - **Google Gemini** (`generativelanguage.googleapis.com`)
    - **Groq** (`api.groq.com/openai/v1`)
    - **Inception Labs Mercury** (`api.inceptionlabs.ai/v1` - diffusion LLMs like `mercury-2.5`)
    - **OpenAI ChatGPT** (`api.openai.com/v1`)
    - **Anthropic Claude** (`api.anthropic.com/v1`)
  - **Dynamic Model Auto-Discovery**: Automatically queries provider model listing endpoints (e.g. `GET /v1/models` or Gemini `v1beta/models`) to dynamically identify, auto-select, or display the newest models available on that key. Zero manual code updates needed when new models release.
  - **Zero-Dependency Local Fallback**: When no API key is provided and Ollama is offline, a deterministic pattern-matching extraction & reasoning engine transparently steps in, ensuring the app is always 100% functional.
- **Security / Session**: **No login required** (per user specification). Designed as a personal single-user or local system memory appliance.

### 2.2 Frontend Specifications
- **Build Tool**: Vite 6+ with React 18/19
- **Styling**: Tailwind CSS + Curated Design System Tokens (Vanilla CSS variables)
- **Animation & Physics**:
  - `motion` (Motion for React / Framer Motion) for layout morphing, spring transitions, and gestures.
  - `GSAP` & `ScrollTrigger` for scroll-linked pins and horizontal incident timelines.
  - `lenis` for buttery smooth momentum scrolling.
- **3D & Shaders**:
  - `three` & `@react-three/fiber` for 3D canvas rendering.
  - Smoke Shader Gradient background (`shadergradient` WebGL concept using black, deep slate, mid-grey, silver, and white specular highlights).
  - Liquid Logo shader (`collidingScopes/liquid-logo` WebGL / Canvas displacement effect).
- **Tour & Micro-Interactions**:
  - `driver.js` for interactive, guided onboarding tour.
  - `uisfx.com` inspired subtle tactile audio feedback (enabled by default with a quick floating mute/unmute toggle in the navbar).
  - `morphicons` / Lucide icons for smooth icon state transitions.

---

## 3. UI/UX Design System: "Craft Over Cliché" (Anti-Vibe-Coded)

### 3.1 Design Principles & Inspirations
Drawing from `ui-ux-pro-max-skill`, `emilkowalski/skills`, `pbakaus/impeccable`, `tasteskill.dev`, `21st.dev`, `kexsio.com`, `designspells.com`, and the user's project `ZYNC` (`zync-watch-party.vercel.app`):
1. **No Generic AI Tropes**: No purple/cyan gradient pill borders, no glowing cosmic dust, no repetitive cookie-cutter card grids, no empty buzzwords.
2. **Direct Page Placement**: Avoid boxing everything into tiny floating cards. Content is placed directly onto structured typographic sections, edge-to-edge data streams, and high-impact informational tables.
3. **Expansive Space Utilization**: Full viewport utilization (`max-w-7xl` or fluid containers) without artificial margins that choke information density.
4. **Obsidian Dark Theme Palette**:
   - Background Base: `#08080C` (True Void Obsidian)
   - Background Elevated: `#0E0E14` (Deep Charcoal Tint)
   - Surface Border: `rgba(255, 255, 255, 0.08)` (Subtle hairline glass border)
   - Text Primary: `#EDEDF2` (High-contrast pure silver-white)
   - Text Secondary: `#8E8EA0` (Neutral stone grey)
   - Text Muted: `#525263` (Subtle metadata grey)
   - Accent Worked / Success: `#10B981` (Vibrant Emerald)
   - Accent Failed / "DO NOT REPEAT": `#EF4444` (Vivid Crimson)
   - Accent Possible / Unknown: `#F59E0B` (Warm Amber)
   - Interactive Accent: `#3B82F6` (Precision Electric Blue, inspired by ZYNC)
5. **Fluid Smoke Background**: Undulating monochromatic WebGL smoke gradient with silky fluid displacement (colors: `#050508`, `#141419`, `#262630`, `#606070`, `#FFFFFF`).
6. **Liquid Logo Experience**: Large hero typography with liquid metal ripple distortion on mouse hover and scroll velocity.

---

## 4. Technical SEO, Production Hygiene & Web Standards

- **Custom Domain Ready**: Fully decoupled relative asset paths, zero hardcoded localhost roots in production configs.
- **Custom 404 Page**: Immersive, branded 404 experience with quick memory search and navigation back to safety.
- **Metadata & Open Graph**:
  - Unique `<title>` per view (e.g. `LastFix — Personal Troubleshooting Memory`, `Ask LastFix — Recall Previous Fixes`).
  - Meta descriptions, canonical link tags (`<link rel="canonical" ... />`).
  - Open Graph (`og:type`, `og:title`, `og:description`, `og:image`, `og:url`).
  - Twitter Cards (`summary_large_image`).
- **Structured Data**: Schema.org `SoftwareApplication` and `TechArticle` in JSON-LD.
- **Search Engine Assets**:
  - `sitemap.xml`
  - `robots.txt`
  - `llms.txt` (Structured markdown documentation for AI web crawlers & agents)
  - Custom SVG Favicon (`favicon.svg`) + `favicon.ico` + apple-touch-icon.
- **Clean Production Bundle**:
  - Zero "Vite + React" default boilerplate text or logos.
  - Source maps disabled for production builds (`build: { sourcemap: false }`).
  - Dynamic chunk splitting for Three.js, GSAP, and Motion to eliminate bloated bundle warnings.
  - Zero console errors or unhandled promise rejections.

---

## 5. Custom Source License & Attribution Policy

This codebase is governed by a **Custom Commercial-Restricted Open Source License**:
1. **Open for Personal & Educational Use**: Any user is free to view, clone, fork, use, test, contribute to, and modify the code.
2. **Commercial Distribution Restriction**: Commercial use, redistribution, resale, or deployment as a paid or commercial service strictly requires prior written permission from the author:
   - **Contact Email**: `vaibhavsoni280506@gmail.com`
3. **Mandatory Attribution**: In any permitted commercial distribution or derivative project, visible credit must be given to **Vaibhav Soni** with a link to his GitHub profile:
   - **Author GitHub**: [https://github.com/VaibhavSoni24](https://github.com/VaibhavSoni24)
   - **Original Project**: **LastFix** (with a link to the original repository).

---

## 6. Current Status & Inventory

| Component | Status | Notes |
| :--- | :--- | :--- |
| **`convo.txt` Ingestion** | **Completed** | Full 1,756 lines deeply parsed; concepts, tech stack, and schedule analyzed. |
| **Workspace Git Repo** | **Initialized** | Empty master branch, ready for first structured commit. |
| **Backend Architecture** | **Designed** | Schema, FTS5 queries, Gemma 3 prompt templates, and FastAPI routes planned. |
| **Frontend Architecture** | **Designed** | WebGL smoke shader, liquid logo, dark UI tokens, and routing mapped. |
| **SEO & Production Assets**| **Designed** | `robots.txt`, `sitemap.xml`, `llms.txt`, and metadata templates prepared. |
| **`convo.txt` Cleanup** | **Pending** | Scheduled for deletion immediately upon this file's creation. |

---

## 7. Step-by-Step Implementation Roadmap

*Note: Every single step concludes with a precise git commit instruction adhering to conventional commits.*

---

### Step 1: Project Scaffolding, Git Configuration, License & `.gitignore`
- Initialize standard project directories: `backend/`, `frontend/`, and root documentation.
- Create custom `LICENSE` file containing the explicit permissions and commercial restrictions for `vaibhavsoni280506@gmail.com` and `https://github.com/VaibhavSoni24`.
- Create clean, comprehensive `.gitignore` covering Python (`venv`, `__pycache__`, `*.db`), Node (`node_modules`, `dist`), IDE configs, and OS artifacts.
- Create initial high-impact `README.md` with project badges, architecture overview, quick start, and Hacktoberfest 2026 problem statement.
> **Git Command:**  
> `git add LICENSE .gitignore README.md Implementation.md && git commit -m "chore: initialize project scaffolding, license, and root documentation"`

---

### Step 2: Backend Core — Database, Models & FTS5 Full-Text Engine
- Set up `backend/requirements.txt` (`fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`, `requests`).
- Implement `backend/app/database.py`: SQLite engine, thread-safety, connection pooling, and automatic FTS5 virtual table initialization.
- Implement `backend/app/models.py`:
  - `Incident`: `id`, `title`, `problem`, `context`, `device_category`, `created_at`, `updated_at`.
  - `Attempt`: `id`, `incident_id`, `action`, `outcome` (`worked` / `failed` / `unknown`), `notes`, `step_order`, `created_at`.
- Implement `backend/app/schemas.py`: Pydantic models for incoming natural language, verified incidents, search results, and API diagnostics.
- Implement `backend/app/search.py`: Lexical extraction and FTS5 ranking queries with BM25 scoring for fast candidate retrieval.
> **Git Command:**  
> `git add backend/ && git commit -m "feat(backend): implement SQLite FTS5 database models and full-text search engine"`

---

### Step 3: Backend AI Engine — Gemma 3 4B Ollama Integration & Fallback Mock
- Implement `backend/app/prompts.py`:
  - Prompt 1: Strict JSON incident extraction from raw, unstructured user speech/text.
  - Prompt 2: Search query expansion (turning user complaints into technical device/system terms).
  - Prompt 3: Memory reasoning prompt synthesizing historical attempts, emphasizing "DO NOT REPEAT" and highlighting proven fixes.
- Implement `backend/app/ai.py` (Hybrid Dynamic Provider Architecture):
  - Local Ollama client (`http://localhost:11434`) targeting `gemma3:4b` with auto-healthcheck.
  - Unified Cloud Provider Adapters supporting user-supplied API keys:
    - **Google Gemini** (`https://generativelanguage.googleapis.com`)
    - **Groq** (`https://api.groq.com/openai/v1`)
    - **Inception Labs Mercury** (`https://api.inceptionlabs.ai/v1` - fast diffusion LLM)
    - **OpenAI ChatGPT** (`https://api.openai.com/v1`)
    - **Anthropic Claude** (`https://api.anthropic.com/v1`)
  - **Dynamic Model Discovery Engine**:
    - Queries `/v1/models` (or Gemini's `v1beta/models`) to automatically list, filter, and select the latest capable model for any valid key without hardcoding or requiring code updates.
  - **Resilient Zero-Dependency Local Fallback Engine**:
    - Automatically activates if no API key is provided and Ollama is unreachable. Performs structured extraction and memory synthesis using local deterministic pattern matching, ensuring 100% zero-crash operation under all conditions.
> **Git Command:**  
> `git add backend/app/ai.py backend/app/prompts.py && git commit -m "feat(backend): implement hybrid dynamic AI engine with auto-model discovery and local fallback"`

---

### Step 4: Backend API Routes, Seed Incidents & Automated Test Suite
- Implement `backend/app/main.py`:
  - FastAPI app instance with CORS middleware (permitting Vite frontend).
  - Endpoints:
    - `POST /api/incidents/extract`: Raw text to structured preview.
    - `POST /api/incidents`: Commit verified incident + attempts to SQLite.
    - `GET /api/incidents`: Paginated list of incidents with counts and outcomes.
    - `GET /api/incidents/{id}`: Detailed timeline for an incident.
    - `DELETE /api/incidents/{id}`: Delete an incident (privacy compliance).
    - `POST /api/search`: Query understanding + FTS5 retrieval + AI reasoning.
    - `GET /api/models`: Dynamic model discovery endpoint for provider keys.
    - `POST /api/seed`: One-click endpoint to populate sample demo memories on demand.
    - `GET /api/health`: Ollama connectivity & database health check.
- Create `backend/app/seed.py`: Seed dataset with 4 realistic incidents (Wi-Fi drop, external monitor detection failure, printer port issue, Git merge conflict).
- Create automated test script `backend/test_api.py` validating incident creation, search retrieval, and "DO NOT REPEAT" logic.
> **Git Command:**  
> `git add backend/app/main.py backend/app/seed.py backend/test_api.py && git commit -m "feat(backend): add complete REST API endpoints, on-demand seed action, and test suite"`

---

### Step 5: Frontend Scaffolding, Design System Tokens & Base Theme
- Initialize modern Vite + React frontend in `frontend/`.
- Configure `tailwind.config.js` and `src/index.css` with dark theme design tokens:
  - Custom colors: `bg-base`, `bg-elevated`, `border-subtle`, `accent-worked`, `accent-failed`, `accent-blue`.
  - Typography: Inter / Plus Jakarta Sans font imports.
  - Custom scrollbar styling, glassmorphism utilities, and smooth selection colors matching ZYNC.
- Install core dependencies: `motion`, `three`, `@react-three/fiber`, `lenis`, `gsap`, `driver.js`, `lucide-react`, `canvas-confetti`.
> **Git Command:**  
> `git add frontend/ && git commit -m "feat(frontend): scaffold Vite React application with dark-mode design tokens and motion libraries"`

---

### Step 6: Creative Engineering — Smoke Shadergradient & Liquid Metal Logo
- Implement WebGL Smoke Shader Gradient component (`src/components/canvas/SmokeShaderBackground.jsx`):
  - Canvas-based custom GLSL fragment shader rendering undulating monochromatic smoke/fog (blending `#060609`, `#121218`, `#202028`, `#71717A`, and `#FFFFFF`).
  - Responsive pixel ratio handling, performant animation loop, and low-GPU idle states.
- Implement Colliding Scopes inspired Liquid Logo component (`src/components/canvas/LiquidLogo.jsx`):
  - WebGL displacement ripple effect over SVG/canvas wordmark.
  - Interactive mouse hover waves and smooth deceleration.
- Create vector SVG branding assets (`public/logo.svg`, `public/favicon.svg`).
> **Git Command:**  
> `git add frontend/src/components/canvas/ frontend/public/ && git commit -m "feat(frontend): implement WebGL smoke shader background and liquid metal logo"`

---

### Step 7: Core Application Views & Direct Page Layouts
- **Navigation Bar**: Minimalistic floating glass header with status badge (Active AI engine & model), 'Load Demo Seed Data' button, audio mute toggle (sound enabled by default), API Key settings modal, and GitHub link.
- **Hero & Search ("Ask LastFix")**:
  - Direct page placement: Large, cinematic question bar ("Have I solved this before?").
  - Instant memory retrieval panel with **"DO NOT REPEAT"** crimson alert banners for failed attempts.
  - **"Last Successful Fix"** emerald highlight card with step-by-step resolution notes and confidence indicator.
- **"Log a Fix" Workflow**:
  - Natural language input textarea with voice/speech dictation placeholder or fast samples.
  - Real-time AI extraction preview: User can review, toggle outcomes (`worked` / `failed`), edit steps, and save directly to local memory.
- **"Fix Timeline & History"**:
  - Full-width chronological data view with device tags, timestamps, and interactive expansion for full attempt logs.
  - One-click 'Load Demo Seed Data' trigger if the database is currently empty.
  - Instant deletion/privacy controls per incident.
> **Git Command:**  
> `git add frontend/src/pages/ frontend/src/components/ && git commit -m "feat(frontend): implement hero search, DO NOT REPEAT diagnosis, and fix logging workflows"`

---

### Step 8: Micro-Interactions, Audio Feedback, Driver.js Tour & Lenis Scroll
- Integrate `lenis` for smooth momentum scrolling across the entire page.
- Add `driver.js` interactive walkthrough tour guiding users through:
  1. The "Ask LastFix" memory search.
  2. The "DO NOT REPEAT" safety mechanism.
  3. The "Log a Fix" AI extraction engine.
- Implement tactile UI sound effects (`src/utils/audio.js`) for button clicks, successful fix highlights, and search completion (enabled by default with instant navbar mute toggle).
- Add micro-animations using `motion`: staggered card reveals, outcome status toggle springs, and hover state transitions.
> **Git Command:**  
> `git add frontend/src/utils/ frontend/src/components/Tour.jsx && git commit -m "feat(frontend): add Lenis smooth scrolling, Driver.js guided tour, and tactile UI SFX"`

---

### Step 9: Technical SEO, Custom 404, Open Graph & Search Engine Assets
- Create high-quality custom 404 page (`src/pages/NotFound.jsx`) with quick search and return home actions.
- Generate and place search engine files:
  - `frontend/public/robots.txt`
  - `frontend/public/sitemap.xml`
  - `frontend/public/llms.txt` (Structured documentation for AI models explaining LastFix's architecture and usage).
- Configure `index.html` with canonical tags, descriptive title, Open Graph images/descriptions, Twitter Card meta tags, and Schema.org `SoftwareApplication` JSON-LD.
- Remove default Vite and React titles, logos, and placeholders.
> **Git Command:**  
> `git add frontend/public/ frontend/index.html frontend/src/pages/NotFound.jsx && git commit -m "feat(seo): add comprehensive SEO metadata, robots.txt, sitemap.xml, llms.txt, and custom 404"`

---

### Step 10: Production Bundle Optimization, End-to-End Testing & Final Verification
- Configure Vite for production optimization:
  - Disable source maps (`sourcemap: false`).
  - Configure manual chunk splitting for `three`, `gsap`, and `motion` to maintain lean chunk sizes.
- Run end-to-end integration tests between frontend, backend, and database.
- Validate responsive layouts across mobile (375px), tablet (768px), laptop (1280px), and ultrawide (1920px+).
- Update `README.md` with final screenshots, architecture diagrams, run commands, and demonstration guide for Hacktoberfest judges.
> **Git Command:**  
> `git add vite.config.js README.md && git commit -m "chore: optimize production build bundles, finalize documentation, and complete verification"`

---

## 8. User Confirmations & Technical Resolutions

All architectural clarifications have been aligned with the user:
1. **Hybrid AI Engine with Dynamic Auto-Discovery (CONFIRMED)**:
   - **Local Ollama first**: Local Gemma 3 4B (`gemma3:4b`).
   - **Cloud Providers**: Gemini, Groq, Inception Labs Mercury, OpenAI, Anthropic Claude.
   - **Dynamic Model Auto-Discovery**: Automatically queries `/v1/models` (or Gemini's model catalog) using the provided key to dynamically discover and pick the latest capable model without requiring future manual updates or hardcoded model lists.
   - **Deterministic Fallback**: If no key is entered and Ollama is not active, a local zero-dependency deterministic engine parses text and generates responses without failure.
2. **Database State (CONFIRMED)**:
   - Starts completely clean/empty on first launch.
   - A sleek, one-click **"Load Demo Seed Data"** action is available in the UI navigation bar and history view so reviewers/evaluators can populate the 4 realistic troubleshooting cases in one second.
3. **UI Sound Effects (CONFIRMED)**:
   - Tactile audio micro-feedback (`uisfx` style) is **enabled by default** with a prominent, floating toggle in the navbar to mute/unmute instantly.
4. **No Login Requirement (CONFIRMED)**:
   - Zero authentication friction, no user accounts or passwords required. Runs as a personal memory vault.
