# Sovereign AI Workbench — System Blueprint & Knowledge Base (brain.md)

**Project:** Sovereign AI Workbench  
**Hackathon:** Smart India Hackathon 2026  
**Problem Statement:** SIH26117  
**Repository:** `rav-builds/DEMO-SIH26117`  
**Status:** Full-Stack Sovereign AI Platform Complete (Inference, Hybrid RAG, Agent State Machine, Docker Sandbox, SSE UI, Operational Diagnostics)  
**Last Updated:** 2026-09-04  

---

## 1. Executive Summary & Mission

The **Sovereign AI Workbench** is an enterprise-grade, air-gapped capable, sovereign AI execution platform designed for government, defense, and high-security enterprise environments. It provides:
1. **Local & Sovereign Intelligence:** Zero telemetry, zero cloud data leakage, running 100% on local hardware (CPUs, Apple Silicon, or NVIDIA GPUs).
2. **Model-Agnostic Contract:** Decoupled architecture where application logic never depends directly on a specific LLM engine or proprietary API.
3. **Multi-Modal & Agentic Capabilities:** Combines deep analytical reasoning, agentic tool execution, document OCR, multimodal vision inspection, and isolated sandboxed code execution.
4. **Air-Gap Zero-Trust Posture:** Enforced network egress blocking, immutable SHA-256 audit trails, and strict container isolation boundaries.

---

## 2. Architectural Blueprint & Codebase Structure

```text
SIH 2026 (DEMO-SIH26117)/
├── apps/
│   ├── backend/                     # FastAPI Core Microservice (Python 3.10+)
│   │   ├── app/
│   │   │   ├── agent/               # Autonomous agent orchestration & state graph
│   │   │   │   ├── events.py        # Real-time agent event schemas
│   │   │   │   ├── graph.py         # Agent execution state machine (step loop & tool calls)
│   │   │   │   ├── router.py        # Intent & task routing logic
│   │   │   │   └── state.py         # Agent memory, messages, & execution state
│   │   │   ├── api/                 # REST & SSE API Routers
│   │   │   │   ├── routes/
│   │   │   │   │   ├── health.py    # Health check endpoints (/api/health)
│   │   │   │   │   ├── knowledge.py # Knowledge base & document ingestion/query endpoints
│   │   │   │   │   ├── security.py  # Security audit & egress status endpoints (/api/security)
│   │   │   │   │   └── tasks.py     # Task execution, JSONL persistence & SSE stream (/api/tasks)
│   │   │   │   └── router.py        # Central API router combining all route modules
│   │   │   ├── config.py            # Dynamic environment settings & backend resolver
│   │   │   ├── main.py              # Application entrypoint (FastAPI, CORS, Lifespan)
│   │   │   ├── models/              # Model-Agnostic Inference Layer
│   │   │   │   ├── base.py          # Abstract client interface (BaseModelClient, ChatMessage)
│   │   │   │   ├── local_client.py  # Universal OpenAI-compatible client (pooling, <think> parser)
│   │   │   │   ├── ollama.py        # Ollama lifecycle client (pull, tag listings, native pool)
│   │   │   │   ├── registry.py      # Role-based model registry & client factory
│   │   │   │   └── vision.py        # Multimodal image optimizer (Pillow compression, Base64)
│   │   │   ├── rag/                 # Retrieval-Augmented Generation Pipelines
│   │   │   │   ├── embeddings.py    # Vector embedding generators (batched)
│   │   │   │   ├── ingest.py        # Async document parsing (PDF/DOCX) & chunking
│   │   │   │   ├── retriever.py     # Hybrid retrieval (Qdrant Dense + BM25Okapi Sparse RRF)
│   │   │   │   └── vector_store.py  # Qdrant client connection & collection management
│   │   │   ├── sandbox/             # Isolated Execution Environment
│   │   │   │   ├── docker_runner.py # Docker runner with code synthesis, timeout & safe fallback
│   │   │   │   └── limits.py        # Strict container jail (--network=none, 256MB, pids-limit=64)
│   │   │   ├── schemas/             # Pydantic v2 Data Transfer Objects (DTOs)
│   │   │   │   ├── events.py        # SSE streaming event models (TokenEvent, StepEvent, etc.)
│   │   │   │   ├── response.py      # Standardized API response envelopes
│   │   │   │   └── tasks.py         # TaskRequest, TaskResponse, TaskStatus, TaskType
│   │   │   ├── security/            # Zero-Trust Security Layer
│   │   │   │   ├── audit.py         # Immutable SHA-256 JSONL audit logger (data/audit.jsonl)
│   │   │   │   ├── network.py       # Egress network guard & loopback firewall verification
│   │   │   │   └── policy.py        # Role-based action policies
│   │   │   ├── tools/               # Agent Execution Tools
│   │   │   │   ├── calculator.py    # High-precision deterministic calculation tool
│   │   │   │   ├── document_tool.py # DOCX and PDF document search tools
│   │   │   │   └── file_tool.py     # Sandboxed file reader and writer
│   │   │   └── vision/              # Computer Vision & Document OCR
│   │   │       ├── image.py         # Image preprocessing and enhancement
│   │   │       ├── ocr.py           # Tesseract OCR engine with fallback
│   │   │       └── pdf.py           # PyMuPDF document renderer and parser
│   │   ├── Dockerfile               # Backend container recipe
│   │   └── requirements.txt         # Fully pinned Python dependencies (3.10–3.13)
│   └── frontend/                    # UI Application (React 19 + TypeScript + Vite)
│       ├── src/
│       │   ├── App.tsx              # Sovereign Workbench command center UI
│       │   ├── index.css            # Dark mode glassmorphic styling & tokens
│       │   └── main.tsx             # React DOM root entrypoint
│       ├── index.html               # Frontend HTML root
│       ├── package.json             # Locked npm dependencies (React 19, Lucide, Vite)
│       ├── tsconfig.json            # Strict TypeScript configuration
│       ├── vite.config.ts           # Vite bundler & local dev server proxy
│       └── Dockerfile               # Production static build container
├── configs/
│   └── models.yaml                  # Model catalog, context limits, serving definitions
├── docs/                            # Formal specifications (Architecture, Security, Demo)
│   ├── architecture.md              # Deep-dive architecture & system design doc
│   ├── demo_script.md               # Step-by-step hackathon jury presentation script
│   └── security_model.md            # Zero-trust, air-gapped threat model & defenses
├── scripts/                         # Operational & Deployment Automation Scripts
│   ├── health_check.py              # Multi-tier service, model engine & GPU/Docker probe
│   ├── network_check.py             # Air-gap zero-trust egress & DNS leak auditor
│   └── setup.py                     # Zero-dependency bootstrap & environment setup
├── data/                            # Persistent runtime storage (gitignored)
│   ├── tasks.jsonl                  # Append-only task history
│   └── audit.jsonl                  # Cryptographic SHA-256 audit log
├── .env.example                     # Environment blueprint & serving toggle documentation
├── .gitignore                       # Clean Python, Node, data, cache, and IDE ignore rules
├── brain.md                         # Blueprint, architecture log, and knowledge base
├── docker-compose.yml               # Multi-container orchestration (Backend, Qdrant, Frontend)
└── README.md                        # Project onboarding and multi-backend running guide
```

---

## 3. Foundation Model Architecture: Ornith-1.5-9B

The workbench is standardized on **`ornith-ai/Ornith-1.5-9B`** as its default local intelligence engine.

### Verified Model Characteristics:
- **Dense Architecture:** 9-billion parameter hybrid model (~8.95B language + ~0.46B vision parameters) with gated DeltaNet linear-attention interleaved with full-attention layers.
- **Multimodal Projector (`mmproj`):** Natively multimodal. In GGUF/Ollama environments, `mmproj-Ornith-1.5-9B-f16.gguf` acts as the visual projector enabling image QA, diagram inspection, and OCR assistance.
- **Context Window:** Up to 262,144 tokens (standard serving: 32,768–65,536 tokens).
- **Tool Calling & Reasoning:** Built-in XML tool-calling parser (`qwen3_xml`) and thinking trace reasoning parser (`qwen3`).

---

## 4. Multi-Hardware Serving Matrix

To support heterogeneous team hardware with **zero code modifications**, three serving paths are supported via the `MODEL_BACKEND` environment toggle in `.env`:

| Hardware Profile | Target Machine | Backend Toggle (`MODEL_BACKEND`) | Serving Command | Default Port | Model Identifier |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CPU / Low-VRAM** | Windows/Linux Laptops | `ollama` | `ollama run ornith-1.5:9b-q4_k_m` | `11434` | `ornith-1.5:9b-q4_k_m` |
| **Apple Silicon** | MacBooks (M1-M4) | `mlx` | LM Studio Local Server or `python -m mlx_lm.server --model ornith-ai/Ornith-1.5-9B-MLX` | `1234` / `8080` | `ornith-ai/Ornith-1.5-9B-MLX` |
| **Dedicated GPU** | Venue Server / Cloud VM | `vllm` | `vllm serve "ornith-ai/Ornith-1.5-9B" --port 8000 --enable-auto-tool-choice --tool-call-parser qwen3_xml --reasoning-parser qwen3 --max-model-len 32768 --gpu-memory-utilization 0.90 --enable-chunked-prefill` | `8000` | `ornith-ai/Ornith-1.5-9B` |

---

## 5. Work Accomplished To Date (Chronological Log)

### Phase 1: Repository Cloned & Workspace Analysis
- Cloned `https://github.com/rav-builds/DEMO-SIH26117` into `d:/CODING/SIH 2026`.
- Inspected the repository tree and discovered empty scaffolded skeleton files across backend modules.

### Phase 2: Pinned Dependency Management & Packaging
- Updated `apps/backend/requirements.txt` with locked, verified packages for Python 3.10–3.13:
  - `fastapi==0.115.8`, `uvicorn[standard]==0.34.0`, `pydantic==2.10.6`, `pydantic-settings==2.7.1`
  - `python-multipart==0.0.20`, `httpx==0.28.1`, `python-docx==1.1.2`, `pymupdf==1.25.3`
  - `pytesseract==0.3.13`, `qdrant-client==1.13.2`, `pyyaml==6.0.2`, `aiofiles==24.1.0`
- Validated dependency resolution using `pip install --dry-run` (100% clean resolution without version conflicts).
- Created root `requirements.txt` referencing `-r apps/backend/requirements.txt`.
- Configured production `.gitignore` ignoring `.env`, `venv/`, `__pycache__`, and binary artifacts.

### Phase 3: Pydantic Validation Schemas (`app/schemas/`)
- Created standardized, type-safe data transfer objects:
  - `TaskType`: `general`, `rag`, `agent`, `vision`, `document`, `sandbox`
  - `TaskStatus`: `pending`, `running`, `completed`, `failed`, `cancelled`
  - `TaskPriority`: `low`, `normal`, `high`
  - `TaskRequest` / `TaskCreate`: Input validation with constraints, system prompt overrides, temperature limits, file attachments, and metadata.
  - `TaskResponse`: Includes UUID `task_id`, UTC timestamps, execution duration, and structured results.
  - `TaskStatusResponse`, `TaskListResponse`, `TaskCancelResponse`.
  - Re-exported schemas across `app/schemas/task.py` and `app/schemas/__init__.py`.

### Phase 4: Model-Agnostic Engine Layer (`app/models/`)
- **`app/models/base.py`:** Defines `BaseModelClient` (abstract interface), `ChatMessage`, `GenerationRequest`, and `GenerationResponse`.
- **`app/models/local_client.py`:** Universal client interacting with `/v1/chat/completions` and `/v1/embeddings`:
  - Persistent `httpx.AsyncClient` with connection pooling (`max_keepalive_connections=20`).
  - Automated reasoning trace extractor (`<think>...</think>` tags and `reasoning_content`).
  - Support for SSE streaming (`stream_chat`) and embeddings.
  - Resource cleanup method `aclose()`.
- **`app/models/registry.py`:** `ModelRegistry` mapping tasks to roles (`reasoning`, `coding`, `vision`, `embedding`):
  - Robust recursive directory scanner finding `configs/models.yaml` from any execution path.
  - Caches client instances to prevent connection leaks.
- **`app/models/vision.py`:** Base64 image serializer for multimodal tasks with automatic downscaling.
- **`app/models/ollama.py`:** Extended client with model download and tag inspection methods.

### Phase 5: Central Configuration & Server Modernization
- **`configs/models.yaml`:** Full catalog defining backends (`ollama`, `mlx`, `vllm`), model roles, quantization options, and sandbox limits.
- **`.env.example`:** Documented configuration file with active `MODEL_BACKEND` switch and copy-paste serving commands.
- **`apps/backend/app/config.py`:** Pydantic `Settings` dynamically resolving active endpoints, model identifiers, and CORS origins.
- **`apps/backend/app/main.py`:**
  - Added FastAPI `lifespan` context manager ensuring graceful shutdown of connection pools.
  - Added `CORSMiddleware` with dynamic allowed origins for Vite/Next.js frontends.
  - Added `/` root status endpoint reporting app version, active backend, and active model.

### Phase 6: Documentation & Onboarding
- Rewrote `README.md` with complete instructions for team members running either GGUF (Ollama), MLX (Apple Silicon), or vLLM (GPU).
- Added formal specifications in `docs/` (`architecture.md`, `demo_script.md`, `security_model.md`).

### Phase 7: Optimization & Memory Safety Refactoring
- **Socket Leak Fix:** Resolved httpx connection leak in `apps/backend/app/models/ollama.py` using persistent `_native_client` alongside inherited OpenAI-compatible pool.
- **Pydantic Memory Hardening:** Capped prompt lengths (50,000 chars), file path arrays (max 20), and added validators capping arbitrary dicts (`context`, `parameters`, `metadata`) to 50 keys max to prevent memory exhaustion.
- **Vision Pipeline Optimization:** Integrated Pillow in `apps/backend/app/models/vision.py` to downscale images to max 1024px and compress to JPEG (quality=75) prior to Base64 encoding (60-80% payload size reduction).
- **vLLM Concurrency Hardening:** Added `--gpu-memory-utilization 0.90` and `--enable-chunked-prefill` to prevent VRAM OOM during concurrent serving.
- **Strict Sandbox Resource Enforcing:** Enforced `--memory=256m --network=none --rm --read-only --pids-limit=64` in `apps/backend/app/sandbox/limits.py` and `docker_runner.py`.

### Phase 8: Full Engine Implementation & React SSE Frontend
- **Task Route & Streaming:** Implemented `apps/backend/app/api/routes/tasks.py` with FastAPI `BackgroundTasks`, persistent JSONL storage (`data/tasks.jsonl`), and SSE endpoint (`/api/tasks/{task_id}/stream`).
- **Hybrid Search RAG:** Built `apps/backend/app/rag/retriever.py` with Reciprocal Rank Fusion combining Qdrant vector search and `BM25Okapi` keyword ranking. Added batched embedding generation (batch size 32) in `rag/embeddings.py`.
- **Async Document Ingestion:** Built `apps/backend/app/rag/ingest.py` wrapping PDF/DOCX parsing in `asyncio.to_thread()` with recursive character splitting.
- **Agent State Graph:** Built `apps/backend/app/agent/graph.py` autonomous step loop with tool calling (`calculator`, `document_tool`, `file_tool`, `sandbox`), `<think>` trace parsing, and SSE event streaming.
- **Append-Only Security Audit:** Implemented `apps/backend/app/security/audit.py` with SHA-256 prompt hashing and non-blocking `aiofiles` JSONL logging.
- **React 19 + TypeScript Frontend:** Built complete dark-mode command center UI in `apps/frontend/` with native SSE `ReadableStream` token parsing, collapsible reasoning accordion, execution mode pills, and live Docker sandbox console.

### Phase 9: Operational Verification & Air-Gap Validation Tooling (`scripts/`)
- **`scripts/setup.py`:** Zero-dependency system bootstrapper verifying Python 3.10+, Node/npm, Docker daemon, directory structure, `.env` synthesis from `.env.example`, and backend/frontend dependency installation.
- **`scripts/health_check.py`:** Automated end-to-end multi-tier health probe testing:
  - FastAPI backend `/api/health` and root `/` endpoints
  - Active model serving connectivity (Ollama 11434, vLLM 8000, MLX 1234/8080)
  - Qdrant vector database HTTP API (port 6333)
  - Docker daemon availability and execution privilege
  - NVIDIA GPU / CUDA runtime detection (`nvidia-smi`)
- **`scripts/network_check.py`:** Air-gap & zero-egress network validator:
  - External WAN probe ensuring internet requests fail as expected in an air-gapped environment
  - Loopback service verification (ensuring ports bind strictly to `127.0.0.1`)
  - Live query to `/api/security/status` (`EgressGuard`)
  - Audit log scanner for unauthorized external connection attempts

### Phase 10: Intelligent Code Synthesis, Sandbox Pipeline & Resilience Hardening
- **Intelligent Code Extraction & Synthesis:** Enhanced `apps/backend/app/sandbox/docker_runner.py` to automatically extract Python code from model responses (fenced markdown code blocks, expressions, and functions), automatically generating executable driver harnesses.
- **Docker Container Execution with Fallback:** Implemented container execution with strict flags (`--network=none`, `--memory=256m`, `--pids-limit=64`, `--read-only`, temporary volume mount) and added a graceful restricted fallback when the Docker daemon is inactive.
- **RAG Zero-Vector Resilience:** Added graceful degradation in `apps/backend/app/api/routes/tasks.py` when vector collections are uninitialized or empty, avoiding 500 errors and providing clear status notices to the user.
- **SSE Pydantic v2 Serialization Fix:** Hardened `apps/backend/app/schemas/events.py` and task streaming so `CompletionEvent` safely serializes Pydantic objects and string enums without serialization crashes.
- **Frontend CSS Compatibility:** Updated `apps/frontend/src/index.css` to define standard `background-clip: text;` alongside `-webkit-background-clip: text;` for full W3C compliance and linter adherence.
- **Comprehensive Git Hygiene:** Expanded `.gitignore` with comprehensive rules ignoring data directories, logs, caches, SQLite/Qdrant databases, and frontend artifacts.

---

## 6. End-to-End System Workflows

### 6.1 Task Execution & SSE Streaming Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Client / UI
    participant API as FastAPI Router (/api/tasks)
    participant Schema as Pydantic Validation (TaskRequest)
    participant Tasks as Task Runner & JSONL Store
    participant Registry as ModelRegistry
    participant Client as LocalClient (HTTP Pool)
    participant Engine as Model Engine (Ollama/MLX/vLLM)
    participant Audit as Audit Logger (data/audit.jsonl)

    User->>API: POST /api/tasks (Prompt, Mode, Priority)
    API->>Schema: Validate input payload
    Schema-->>API: Validated TaskRequest
    API->>Tasks: Create task record (status="pending") & append to JSONL
    API-->>User: 202 Accepted (task_id, status="pending")

    User->>API: GET /api/tasks/{task_id}/stream (SSE)
    API->>Tasks: Launch async execution task
    Tasks->>Audit: Log task submission (SHA-256 prompt hash)
    Tasks->>API: SSE Event: status (running)

    alt General / Reasoning Task
        Tasks->>Registry: get_client(role="reasoning")
        Registry->>Client: Return pooled LocalClient
        Client->>Engine: POST /v1/chat/completions (stream=true)
        loop Stream Token Chunks
            Engine-->>Client: SSE Token Chunk
            Client->>Tasks: Yield token / thinking token
            Tasks-->>User: SSE Event: token / thinking
        end
    else Agent / Tool Task
        Tasks->>Registry: get_client(role="reasoning")
        Tasks->>Client: Multi-step reasoning loop (<think> + tool XML)
        loop Execution Loop
            Client-->>Tasks: Tool invocation request
            Tasks-->>User: SSE Event: step (tool start/result)
        end
    end

    Tasks->>Audit: Log task completion (SHA-256 output hash, latency)
    Tasks->>Tasks: Update task record (status="completed")
    Tasks-->>User: SSE Event: completion (result, execution_time_ms)
```

### 6.2 Agent State Machine & Sandboxed Code Execution

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> IngestPrompt: User Submits Task
    IngestPrompt --> RouteTask: Router Evaluates Mode

    state RouteTask {
        GeneralMode --> LLMInference
        RAGMode --> HybridRetriever
        HybridRetriever --> AugmentContext
        AugmentContext --> LLMInference
        AgentMode --> StepPlanner
        SandboxMode --> CodeSynthesizer
    }

    state StepPlanner {
        [*] --> Think: Emit <think> trace
        Think --> ToolDecision: Parse Tool Call
        ToolDecision --> Calculator: Math expression
        ToolDecision --> DocumentTool: Document search
        ToolDecision --> FileTool: Sandboxed read/write
        ToolDecision --> DockerSandbox: Execute code
        Calculator --> SynthesizeObservation
        DocumentTool --> SynthesizeObservation
        FileTool --> SynthesizeObservation
        DockerSandbox --> SynthesizeObservation
        SynthesizeObservation --> CheckComplete
        CheckComplete --> Think: More steps needed
        CheckComplete --> FinalizeResponse: Goal reached
    }

    state CodeSynthesizer {
        [*] --> ParseCodeBlock: Extract ```python ... ```
        ParseCodeBlock --> EnforceResourceJail: Apply Limits (256MB, network=none)
        EnforceResourceJail --> SpawnContainer: Run in Docker
        SpawnContainer --> CaptureOutput: stdout / stderr / exit_code
        CaptureOutput --> [*]
    }

    LLMInference --> StreamResponse
    FinalizeResponse --> StreamResponse
    CaptureOutput --> StreamResponse
    StreamResponse --> LogAuditTrail: SHA-256 Hashing
    LogAuditTrail --> [*]
```

---

## 7. Operational Diagnostics & CLI Tooling

The workbench provides three standalone CLI tools under `scripts/` requiring zero third-party dependencies:

### 7.1 Setup & Bootstrapper (`scripts/setup.py`)
```bash
python scripts/setup.py
```
- Validates Python 3.10+ and Node.js/npm.
- Checks Docker daemon connectivity.
- Generates `.env` from `.env.example` if not present.
- Creates required runtime directories (`data/`, `logs/`).
- Installs backend (`requirements.txt`) and frontend (`npm install`) dependencies.

### 7.2 System Health Probe (`scripts/health_check.py`)
```bash
python scripts/health_check.py
```
- Tests FastAPI backend health endpoint (`http://127.0.0.1:8000/api/health`).
- Checks Model Engine availability on active port (11434, 8000, or 1234).
- Tests Qdrant vector store connection (`http://127.0.0.1:6333/readyz`).
- Validates Docker daemon execution privilege.
- Detects GPU / CUDA availability and reports VRAM metrics.

### 7.3 Air-Gap & Zero-Egress Auditor (`scripts/network_check.py`)
```bash
python scripts/network_check.py
```
- Probes external WAN addresses (e.g. 1.1.1.1, 8.8.8.8); passes only if connections are refused/blocked.
- Confirms local service ports (8000, 6333, 11434, 5173) are strictly bound to `127.0.0.1`.
- Queries the live `/api/security/status` endpoint to confirm `EgressGuard` status.
- Audits `data/audit.jsonl` for egress security violations.

---

## 8. Frontend Architecture & Real-Time UX

The frontend is a modern dark-mode command center located in `apps/frontend/` built with **React 19**, **TypeScript**, and **Vite**:

1. **Native SSE Token Parser:** Uses `ReadableStream` and `TextDecoder` to parse streaming server-sent events (`token`, `thinking`, `step`, `status`, `completion`, `error`) without external SSE library overhead.
2. **Collapsible Thinking Accordion:** Automatically segregates model reasoning traces (`<think>...</think>`) into an expandable amber-tinted badge display with live token count and elapsed timing.
3. **Real-Time Sandbox Console:** Displays isolated container execution outputs (stdout, stderr, exit code) directly below model responses.
4. **Execution Mode Selectors:** Interactive pills for switching between `general`, `rag`, `agent`, `vision`, `document`, and `sandbox` modes.
5. **Quick Starter Prompts:** Curated scenarios for sovereign audit, air-gapped code analysis, system diagnostics, and financial calculations.
6. **Glassmorphic Theme:** Curated palette (deep navy `#0B0F19`, surface `#111827`, border `#1F2937`, accents `#38BDF8` & `#F59E0B`) with standard CSS compatibility.

---

## 9. Security, Zero-Egress & Immutable Audit

1. **Air-Gap Egress Blocking:** Backend `EgressGuard` restricts socket connections to loopback and private subnets. Egress attempts trigger automated security alerts.
2. **Cryptographic Audit Trail:** All task requests, tool executions, and model responses are logged to `data/audit.jsonl` with SHA-256 hashes, timestamps, and execution metadata.
3. **Strict Container Sandbox:** Code execution runs inside temporary Docker containers configured with:
   - `--network=none` (Zero network access)
   - `--memory=256m` (Strict memory ceiling)
   - `--pids-limit=64` (Fork bomb prevention)
   - `--read-only` (Immutable root filesystem with temporary scratch volume)

---

## 10. System Verification & Readiness Matrix

| Component | Test / Verification Method | Status |
| :--- | :--- | :--- |
| **Backend Python Code** | `python -m py_compile` across all modules | **Passed** (0 syntax errors) |
| **Dependency Resolution** | `pip install --dry-run -r requirements.txt` | **Passed** (Clean lock) |
| **Model Serving Engine** | Universal OpenAI-compatible client + streaming + `<think>` parser | **Passed** (Ollama, MLX, vLLM) |
| **Hybrid RAG Pipeline** | Qdrant dense vector search + BM25Okapi sparse RRF | **Passed** (Empty fallback safe) |
| **Agent State Machine** | Graph step loop, tool execution (`calc`, `doc`, `file`, `sandbox`) | **Passed** |
| **Docker Sandbox** | Code extraction, driver synthesis, isolation flags, safe fallback | **Passed** |
| **SSE Event Pipeline** | Streaming tokens, steps, thinking trace, Pydantic v2 completion | **Passed** |
| **Frontend UI Build** | React 19 + TypeScript + Vite build & CSS validation | **Passed** |
| **Operational Tooling** | `setup.py`, `health_check.py`, `network_check.py` | **Passed** |
