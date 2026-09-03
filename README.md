# Sovereign AI Workbench (SIH 2026 - Problem Statement SIH26117)

A modular, sovereign, and model-agnostic AI workbench developed for the **Smart India Hackathon 2026 (SIH26117)**. The workbench combines autonomous AI agents, Retrieval-Augmented Generation (RAG), multimodal computer vision, sandboxed code execution, and security auditing.

The system is powered locally by the **Ornith-1.5-9B** foundation model (`ornith-ai/Ornith-1.5-9B`), designed with a zero-lockin, model-agnostic serving contract supporting:
- **GGUF / Ollama** for universal CPU & low-VRAM laptops/machines.
- **MLX / LM Studio** for Apple Silicon MacBooks (M1/M2/M3/M4).
- **vLLM** for dedicated GPU servers.

---

## Foundation Model: Ornith-1.5-9B

- **Architecture:** Dense ~9B model (~8.95B language + ~0.46B vision parameters) with hybrid DeltaNet + full-attention layers.
- **Native Multimodal Support:** Includes a vision tower accessible via `mmproj` (`mmproj-Ornith-1.5-9B-f16.gguf`) for visual reasoning, document inspection, and diagram QA.
- **Agentic & Tool Calling:** Built-in XML tool-calling parser (`qwen3_xml`) and thinking trace reasoning parser (`qwen3`).
- **Context Window:** Up to 262,144 tokens.
- **Hardware Flexibility:** Deployable on Apple Silicon (MLX), quantized GGUF on consumer CPUs/GPUs (`Q4_K_M`, `Q5_K_M`, `Q8_0`), or full precision on single GPUs.

---

## Project Architecture

```text
DEMO-SIH26117/
├── apps/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── agent/       # Autonomous AI agent workflows
│   │   │   ├── api/         # REST API routers & health checks
│   │   │   ├── models/      # Model-agnostic clients & registry (Base, LocalClient, Ollama, Vision)
│   │   │   ├── rag/         # RAG embeddings, ingestion & vector store
│   │   │   ├── sandbox/     # Isolated code execution sandbox
│   │   │   ├── schemas/     # Pydantic v2 task & response models
│   │   │   ├── security/    # Policy enforcement & audit logging
│   │   │   ├── tools/       # Document, calculation, and system tools
│   │   │   └── vision/      # Image and PDF OCR pipelines
│   │   ├── Dockerfile
│   │   └── requirements.txt # Pinned backend dependencies
│   └── frontend/            # React + TypeScript frontend
├── configs/
│   └── models.yaml          # Multi-backend model catalog & endpoints
├── docs/                    # Architecture and security documentation
├── scripts/                 # Health checks & setup utilities
├── .env.example             # Centralized environment template with MODEL_BACKEND toggle
└── docker-compose.yml       # Multi-service orchestration
```

---

## Local Serving Setup: Choose Your Engine

Teammates can run on different hardware without modifying application code. Set `MODEL_BACKEND` in your `.env` file to match your hardware:

```env
# Choose: 'ollama' (GGUF) | 'mlx' (Apple Silicon) | 'vllm' (GPU Server)
MODEL_BACKEND="ollama"
```

---

### Path 1: GGUF / Ollama (Universal CPU & Low-VRAM Laptops)

Recommended for team members running on Windows, Linux, or CPU-only laptops without a dedicated GPU.

#### 1. Launch with Ollama
```bash
# Pull and start the quantized Ornith-1.5-9B GGUF model
ollama run ornith-1.5:9b-q4_k_m
```

#### 2. (Optional) Enable Vision with `mmproj`
To enable multimodal vision in Ollama:
1. Download `Ornith-1.5-9B-Q4_K_M.gguf` and `mmproj-Ornith-1.5-9B-f16.gguf`.
2. Create a `Modelfile`:
   ```dockerfile
   FROM ./Ornith-1.5-9B-Q4_K_M.gguf
   ADAPTER ./mmproj-Ornith-1.5-9B-f16.gguf
   ```
3. Build the model:
   ```bash
   ollama create ornith-1.5:9b-q4_k_m -f Modelfile
   ```

#### 3. Test GGUF Endpoint
```bash
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "ornith-1.5:9b-q4_k_m",
    "messages": [
      {"role": "user", "content": "Hello! Explain what 14 * 16 is."}
    ]
  }'
```

---

### Path 2: MLX (Apple Silicon MacBooks)

Recommended for team members running on Apple Silicon (M1/M2/M3/M4) for unified memory performance.

#### Option A: Via LM Studio
1. Open **LM Studio** on macOS.
2. Search and download `ornith-ai/Ornith-1.5-9B-MLX`.
3. Navigate to the **Local Server** tab and click **Start Server** on port `1234`.

#### Option B: Via `mlx-lm` CLI
```bash
pip install mlx-lm
python -m mlx_lm.server --model "ornith-ai/Ornith-1.5-9B-MLX" --port 8080
```

#### Test MLX Endpoint
```bash
# If using LM Studio (port 1234):
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "ornith-ai/Ornith-1.5-9B-MLX",
    "messages": [
      {"role": "user", "content": "Hello! Explain what 14 * 16 is."}
    ]
  }'
```

---

### Path 3: vLLM (Dedicated GPU Server)

If deploying to a dedicated NVIDIA GPU server:
```bash
vllm serve "ornith-ai/Ornith-1.5-9B" \
  --port 8000 \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_xml \
  --reasoning-parser qwen3 \
  --max-model-len 32768
```

---

## Workbench Backend Setup

### 1. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` to set your active `MODEL_BACKEND`:
- Use `MODEL_BACKEND="ollama"` on CPU/GGUF setups.
- Use `MODEL_BACKEND="mlx"` on Apple Silicon laptops.
- Use `MODEL_BACKEND="vllm"` on GPU servers.

### 2. Install Dependencies
```bash
cd apps/backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Run Development Server
```bash
uvicorn app.main:app --reload --port 8000
```

- **Interactive API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check Endpoint:** `GET http://localhost:8000/api/health` -> `{"status": "ok"}`

---

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 |
| **Local LLMs** | Ornith-1.5-9B (GGUF / MLX / vLLM) |
| **Vector DB** | Qdrant |
| **Document Processing** | PyMuPDF, python-docx, Tesseract OCR |
| **Frontend** | React, TypeScript |
| **Sandbox & Deploy** | Docker, Docker Compose |
