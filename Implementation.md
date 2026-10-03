# LastFix — Master Implementation & Architectural Blueprint

> **"LastFix doesn't tell you how to fix a problem. It remembers how you fixed it."**  
> *Every time something breaks, LastFix records what you tried, what failed, and what worked. When the same problem happens again, it retrieves your previous experience instead of making you start from zero. And because the memory lives locally with Gemma, your troubleshooting history can stay on your device.*

---

## 1. Project Overview & Hacktoberfest 2026 Genesis

### 1.1 Context & Hacktoberfest 2026 Genesis
- **Event**: Hacktoberfest 2026 Open-Source AI Weekend Challenge ("Build for a Friend") hosted on the DEV Community in partnership with Google DeepMind (Gemma), Render, TabPFN, DigitalOcean, MongoDB Atlas, Sentry, and others.
- **Submission Deadline**: Monday, October 5, 2026 at 6:59 AM UTC (**12:29 PM IST**).
- **Core Requirements**:
  1. Brand-new project built from scratch during the challenge window.
  2. Open-source / open-weight AI at the core (Gemma 3 4B via local Ollama inference).
  3. Solves a genuine, tangible problem for a friend or loved one.
  4. Working demo: high-resolution screen-recorded walkthrough or live deployment.
  5. Public GitHub repository with clean history, structured documentation, and open source ethos (MIT License).
  6. Comprehensive DEV Community article written using the official template + `#hf26challenge`, articulating why open-source and local AI matters.

### 1.2 The Human Story: Solving a Real Problem for Tilak & Saumya
The Hacktoberfest theme is **"Build for a Friend"**. LastFix is built directly around real recurring pain points experienced by:
- **Tilak Khatoria** (Friend): Constantly plagued by laptop display detection glitches over USB-C/HDMI and recurring Git merge conflict cascades. Every time it happens, he spends 15–20 minutes fruitlessly retrying restart sequences that never worked before.
- **Saumya Soni** (Sister): Frequently encounters Wi-Fi disappearing after Windows wakes from sleep and printer connection drops. Every time, she repeats the same failed reboot attempts before finally remembering that resetting the network adapter was the only thing that worked.

LastFix is built for them: when technology fails, instead of starting from zero or wading through generic search results, they open LastFix and immediately recover what *they* actually did to fix it.

### 1.3 The Core Problem: Why Traditional Solutions Fail
When technical problems strike, users make two consistent errors:
1. **Searching Google or Generic AI**: Search engines return SEO-spam articles with 15 generic tips. Generic AI chatbots hallucinate or spit out encyclopedic checklists that don't reflect the user's specific OS, hardware revision, or home network topology.
2. **Repeating Failed Steps**: Users spend 20 minutes restarting laptops, replugging cables, and clearing caches—actions that *already failed* the last three times they encountered the issue.

### 1.4 The LastFix Solution
LastFix is **NOT** a generic troubleshooting chatbot. It is a **Personal Troubleshooting Memory System**. It records:
- **The Incident & Context**: What broke, when, and the environment (Device, OS, Situation, Subsystem).
- **The Attempts Timeline**: Every action taken, explicitly cataloged as `worked`, `failed`, or `unknown`.
- **Evidence-Based "Previously Tried" Analysis**: Empirically distinguishes actions that failed in past incidents from the proven fix, warning the user against blindly retrying steps that yielded no results last time.
- **The Confirmed Fix**: The exact intervention that actually resolved the issue.
- **Evidence Trail ("Why am I seeing this?")**: Full transparency showing matched keywords and contextual attributes.

### 1.5 Why Local Open-Weight AI (Gemma 3 4B)?
- **Local Data Residency**: Cloud AI can require personal troubleshooting data—internal IP addresses, device serials, company software names, home router settings, and personal habits—to leave the user's device. LastFix keeps this memory local by default.
- **True Offline Resilience**: When your Wi-Fi, Ethernet, or modem drops, cloud AI is completely unreachable. LastFix runs Gemma 3 4B locally via Ollama on localhost and operates 100% offline.
- **Precise 3-Stage AI Role**:
  1. *Memory Extraction*: Converts natural language into structured JSON incidents, inferring context (OS, device, trigger) without tedious manual forms.
  2. *Query Understanding*: Expands colloquial problem descriptions into technical subsystem keywords.
  3. *Memory Reasoning*: Synthesizes retrieved historical memories, evaluates multiple past fixes, and presents evidence-based recommendations.

### 1.6 Nuanced Originality Statement
*"I couldn't find a tool focused specifically on remembering my own troubleshooting attempts and recovering the fix that worked."* LastFix focuses specifically on personal procedural memory and empirical attempt histories.

---

## 2. High-Level Architecture & Tech Stack

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

### 2.1 Backend Specifications
- **Framework**: FastAPI (100% Asynchronous Python 3.10+)
- **Server**: Uvicorn ASGI
- **Asynchronous HTTP Client**: `httpx.AsyncClient` (replaces synchronous `requests` to guarantee non-blocking event loop execution during all outbound LLM calls).
- **Database**: SQLite 3 with native FTS5 (Full-Text Search 5) virtual tables for BM25-ranked lexical matching. Database starts clean/empty.
- **ORM / Schemas**: SQLAlchemy 2.0+ (declarative models) & Pydantic v2 (strict typed contracts).
- **AI Engine (Hybrid Dynamic Architecture with Provenance)**:
  - **Tier 1 (Preferred / Core)**: Local Gemma 3 4B (`gemma3:4b`) via Ollama on `http://localhost:11434`.
  - **Tier 2 (Cloud Fallback / Remote Deployments)**: In-app settings supporting user API keys for:
    - **Google Gemini** (`generativelanguage.googleapis.com`)
    - **Groq** (`api.groq.com/openai/v1`)
    - **Inception Labs Mercury** (`api.inceptionlabs.ai/v1` - fast diffusion LLM)
    - **OpenAI ChatGPT** (`api.openai.com/v1`)
    - **Anthropic Claude** (`api.anthropic.com/v1`)
    - *Dynamic Model Auto-Discovery*: Automatically queries `/v1/models` or Gemini `v1beta/models` to discover and select the newest chat models on that key without requiring hardcoded updates.
  - **Tier 3 (Local Deterministic Fallback)**: If no key is set and Ollama is unreachable, a local regex/pattern-based extraction and retrieval engine executes so the app never crashes or errors out.
  - **Engine Transparency**: Every response explicitly badges its provenance:
    - `Source: Local Gemma 3 4B (Ollama)`
    - `Source: Cloud API ({provider} - {model})`
    - `Source: Local Deterministic Engine (Ollama Offline)`
  - **Ollama Status Banner**: If Gemma is unavailable, the UI clearly instructs:
    `"Gemma is not running. Start Ollama and run: ollama run gemma3:4b"`
- **Security / Session**: **No login required**. Personal single-user memory vault.

### 2.2 Frontend Specifications & True Offline Resilience
- **Build Tool**: Vite 6+ with React 18/19
- **True Offline Self-Containment**:
  - Bundled local/system font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Plus Jakarta Sans", sans-serif`.
  - Zero Google Fonts or external CDN links.
  - Zero remote images or external tracking scripts.
  - Fully functional when the network adapter is completely disconnected.
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
   - Accent Failed / Previously Tried: `#EF4444` (Vivid Crimson)
   - Accent Possible / Unknown: `#F59E0B` (Warm Amber)
   - Interactive Accent: `#3B82F6` (Precision Electric Blue, inspired by ZYNC)
5. **Fluid Smoke Background**: Undulating monochromatic WebGL smoke gradient with silky fluid displacement (colors: `#050508`, `#141419`, `#262630`, `#606070`, `#FFFFFF`).
6. **Liquid Logo Experience**: Large hero typography with liquid metal ripple distortion on mouse hover and scroll velocity.

---

## 4. Evidence-Based Diagnostic UX & Transparency

### 4.1 Evidence Status (NO Fabricated AI Probabilities)
LastFix rejects synthetic AI confidence scores (e.g. `Confidence: 92%`). Instead, it uses **Database Evidence Status**:
- `CONFIRMED FIX`: The user explicitly recorded that this intervention resolved the problem.
- `UNCONFIRMED`: The user attempted this action, but never verified whether it worked.

### 4.2 Previously Tried vs. Permanent Prohibition
The UI avoids overclaiming that an action is permanently invalid.
- **Section Badge**: `PREVIOUS ATTEMPTS / EVIDENCE`
- **Item Breakdown**:
  - `✕ Restart laptop — Failed in this incident`
  - `✓ Reset network adapter — Resolved the problem`
- **Contextual Note**: *"Last time, restarting did not resolve the issue."* (Empirically accurate, acknowledges that future conditions or driver updates might change outcomes).

### 4.3 Evidence Trail ("Why am I seeing this?")
Every search result contains an expandable evidence drawer showing:
- Incident ID & timestamp.
- Inferred Context tags (`Device: Laptop`, `OS: Windows 11`, `Situation: After sleep`).
- Exact lexical terms matched via SQLite FTS5:
  `Matched: "Wi-Fi" • "network adapter" • "laptop" • "disappeared after sleep"`

### 4.4 Handling Multiple Historical Fixes
If a query matches multiple past incidents with different confirmed fixes:
- Header: *"Found 3 related incidents in your history."*
- Primary: *"Most recent confirmed fix: Reset network adapter (Incident #3 — Oct 3, 2026)"*
- Secondary list: *"Other confirmed fixes: Restart router (Incident #2), Reinstall driver (Incident #1)"*
- Honest reflection of user history rather than pretending there is a single universal truth.

---

## 5. Technical SEO, Production Hygiene & Web Standards

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
  - `llms.txt` (Structured documentation for AI models explaining LastFix's architecture and usage).
  - Custom SVG Favicon (`favicon.svg`) + `favicon.ico` + apple-touch-icon.
- **Clean Production Bundle**:
  - Zero "Vite + React" default boilerplate text or logos.
  - Source maps disabled for production builds (`build: { sourcemap: false }`).
  - Dynamic chunk splitting for Three.js, GSAP, and Motion to eliminate bloated bundle warnings.
  - Zero console errors or unhandled promise rejections.

---

## 6. Open Source Licensing (MIT License)

To maintain standard Hacktoberfest 2026 eligibility and open-source compliance:
- LastFix is licensed under the standard **MIT License**.
- Full freedom to view, use, modify, distribute, and contribute.
- Author attribution: **Vaibhav Soni** ([https://github.com/VaibhavSoni24](https://github.com/VaibhavSoni24)).

---

## 7. Current Status & Inventory

| Component | Status | Notes |
| :--- | :--- | :--- |
| **`convo.txt` Ingestion & Cleanup** | **Completed** | Full transcript analyzed, design refined, file removed from workspace. |
| **Git Repository** | **Initialized** | Initial plan committed on master branch. |
| **Backend Architecture** | **Refined** | Async `httpx`, SQLite FTS5, Gemma 3 4B Ollama + multi-cloud + fallback planned. |
| **Frontend Architecture** | **Refined** | Self-contained offline assets, WebGL smoke shader, liquid logo, evidence drawer. |
| **Human Story Grounding** | **Defined** | Built for Tilak Khatoria and Saumya Soni. |
| **License Definition** | **Updated** | Standard MIT License selected. |

---

## 8. Step-by-Step Implementation Roadmap

*Note: Every single step concludes with a precise git commit instruction adhering to conventional commits.*

---

### Step 1: Project Scaffolding, MIT License & `.gitignore`
- Initialize standard project directories: `backend/`, `frontend/`, and root documentation.
- Create standard `LICENSE` (MIT License) attributing Vaibhav Soni.
- Create clean, comprehensive `.gitignore` covering Python (`venv`, `__pycache__`, `*.db`), Node (`node_modules`, `dist`), IDE configs, and OS artifacts.
- Create initial high-impact `README.md` with project badges, architecture overview, quick start, the Tilak & Saumya friend story, and Hacktoberfest problem statement.
> **Git Command:**  
> `git add LICENSE .gitignore README.md Implementation.md && git commit -m "chore: initialize project scaffolding, MIT license, and root documentation"`

---

### Step 2: Backend Core — Database, Models & FTS5 Full-Text Engine
- Set up `backend/requirements.txt` (`fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`, `httpx`).
- Implement `backend/app/database.py`: SQLite engine, thread-safety, connection pooling, and automatic FTS5 virtual table initialization.
- Implement `backend/app/models.py`:
  - `Incident`: `id`, `title`, `problem`, `context`, `device`, `os`, `situation`, `subsystem`, `created_at`, `updated_at`.
  - `Attempt`: `id`, `incident_id`, `action`, `outcome` (`worked` / `failed` / `unknown`), `notes`, `step_order`, `created_at`.
- Implement `backend/app/schemas.py`: Pydantic models for incoming natural language, verified incidents, search results, and API diagnostics.
- Implement `backend/app/search.py`: Lexical extraction and FTS5 ranking queries with BM25 scoring for fast candidate retrieval.
> **Git Command:**  
> `git add backend/ && git commit -m "feat(backend): implement SQLite FTS5 database models and full-text search engine"`

---

### Step 3: Backend AI Engine — Asynchronous Gemma 3 4B Ollama & Dynamic Discovery
- Implement `backend/app/prompts.py`:
  - Prompt 1: Strict JSON incident extraction from raw, unstructured user speech/text (inferring `device`, `os`, `situation`, `subsystem` automatically).
  - Prompt 2: Search query expansion (turning user complaints into technical device/system terms).
  - Prompt 3: Memory reasoning prompt synthesizing historical attempts, distinguishing previous failures from the confirmed fix, and identifying multiple historical solutions.
- Implement `backend/app/ai.py` (Asynchronous Hybrid Dynamic Architecture using `httpx.AsyncClient`):
  - Local Ollama client (`http://localhost:11434`) targeting `gemma3:4b` with auto-healthcheck.
  - Unified Cloud Provider Adapters supporting user-supplied API keys:
    - **Google Gemini** (`https://generativelanguage.googleapis.com`)
    - **Groq** (`https://api.groq.com/openai/v1`)
    - **Inception Labs Mercury** (`https://api.inceptionlabs.ai/v1`)
    - **OpenAI ChatGPT** (`https://api.openai.com/v1`)
    - **Anthropic Claude** (`https://api.anthropic.com/v1`)
  - **Dynamic Model Discovery Engine**: Queries `/v1/models` or Gemini `v1beta/models` to discover and select the newest capable chat model for any valid key without hardcoded lists.
  - **Resilient Zero-Dependency Local Fallback Engine**: Transparent deterministic pattern-matching engine activating when Ollama is offline and no API key is set.
  - Explicit provenance tagging on every response (`Local Gemma 3 4B`, `Cloud API`, or `Local Fallback`).
> **Git Command:**  
> `git add backend/app/ai.py backend/app/prompts.py && git commit -m "feat(backend): implement async multi-provider AI engine with dynamic discovery and provenance"`

---

### Step 4: Backend API Routes, Seed Incidents & Automated Test Suite
- Implement `backend/app/main.py`:
  - FastAPI app instance with CORS middleware (permitting Vite frontend).
  - Endpoints:
    - `POST /api/incidents/extract`: Raw text to structured preview with inferred context.
    - `POST /api/incidents`: Commit verified incident + attempts to SQLite.
    - `GET /api/incidents`: Paginated list of incidents with counts, context tags, and outcomes.
    - `GET /api/incidents/{id}`: Detailed timeline for an incident.
    - `DELETE /api/incidents/{id}`: Delete an incident (privacy compliance).
    - `POST /api/search`: Query understanding + FTS5 retrieval + AI reasoning + evidence trail.
    - `GET /api/models`: Dynamic model discovery endpoint for provider keys.
    - `POST /api/seed`: One-click endpoint to populate sample demo memories on demand.
    - `GET /api/health`: Ollama connectivity & database health check.
- Create `backend/app/seed.py`: 4 realistic demo incidents tailored to Tilak & Saumya:
  1. Wi-Fi disappeared after sleep (Windows 11 Laptop — Fix: Reset Network Adapter).
  2. External 4K monitor not detected over USB-C (macOS Desktop — Fix: Reconnect display adapter).
  3. Windows printer offline in print spooler (Windows 11 Desktop — Fix: Re-add printer in Settings).
  4. Git merge conflict cascade in node_modules (Linux/WSL — Fix: Reset lockfile and run npm install).
- Create automated test script `backend/test_api.py` validating incident creation, search retrieval, evidence trail, and multiple-fix handling.
> **Git Command:**  
> `git add backend/app/main.py backend/app/seed.py backend/test_api.py && git commit -m "feat(backend): add complete REST API endpoints, on-demand seed action, and test suite"`

---

### Step 5: Frontend Scaffolding, Self-Contained Offline Assets & Base Theme
- Initialize modern Vite + React frontend in `frontend/`.
- Configure `tailwind.config.js` and `src/index.css` with dark theme design tokens:
  - Custom colors: `bg-base`, `bg-elevated`, `border-subtle`, `accent-worked`, `accent-failed`, `accent-blue`.
  - Self-contained system font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Plus Jakarta Sans", sans-serif` (zero external CDN requests).
  - Custom scrollbar styling, glassmorphism utilities, and smooth selection colors matching ZYNC.
- Install core dependencies: `motion`, `three`, `@react-three/fiber`, `lenis`, `gsap`, `driver.js`, `lucide-react`, `canvas-confetti`.
> **Git Command:**  
> `git add frontend/ && git commit -m "feat(frontend): scaffold Vite React application with self-contained dark-mode design tokens and motion libraries"`

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
- **Navigation Bar**: Minimalistic floating glass header with AI Engine status badge (`● Gemma 3 4B — Connected` or offline prompt), audio mute toggle (enabled by default), API Key settings modal, and GitHub link.
- **Hero & Search ("Ask LastFix")**:
  - Direct page placement: Large question bar ("Have I solved this before?").
  - Provenance badge (`Source: Local Gemma 3 4B`).
  - **"Last Successful Fix"** emerald highlight card with evidence status (`CONFIRMED FIX`).
  - **"Previously Tried"** crimson alert card with evidence-based note: *"Last time, restarting did not resolve the issue."*
  - **"Why am I seeing this?"** expandable evidence trail drawer displaying matched lexical tokens and context tags.
  - **Multi-Fix Synthesizer** displaying recent and historical fixes when multiple incidents match.
- **"Log a Fix" Workflow**:
  - Natural language input textarea with voice/speech dictation placeholder or fast samples.
  - Real-time AI extraction preview: User reviews inferred context (`device`, `os`, `situation`), toggles outcomes (`worked` / `failed`), edits steps, and saves to memory.
- **"Fix Timeline & History"**:
  - Full-width chronological data view with context badges, timestamps, and interactive expansion for full attempt logs.
  - **Empty State Banner**: When 0 incidents exist, displays:
    `"No memories yet. Want to explore LastFix? [Load Demo Memories]"`
    (Disappears cleanly once any incidents exist).
  - Instant deletion/privacy controls per incident.
> **Git Command:**  
> `git add frontend/src/pages/ frontend/src/components/ && git commit -m "feat(frontend): implement hero search, evidence-based diagnosis, and fix logging workflows"`

---

### Step 8: Micro-Interactions, Audio Feedback, Driver.js Tour & Lenis Scroll
- Integrate `lenis` for smooth momentum scrolling across the entire page.
- Add `driver.js` interactive walkthrough tour guiding users through:
  1. The "Ask LastFix" memory search.
  2. The evidence-based "Previously Tried" section.
  3. The "Why am I seeing this?" evidence drawer.
  4. The "Log a Fix" natural language extraction engine.
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
- Update `README.md` with final screenshots, architecture diagrams, run commands, the Tilak & Saumya story, and demonstration guide for Hacktoberfest judges.
> **Git Command:**  
> `git add vite.config.js README.md && git commit -m "chore: optimize production build bundles, finalize documentation, and complete verification"`
