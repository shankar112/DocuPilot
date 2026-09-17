# DocuPilot

DocuPilot is a document-aware question-answering assistant. It lets users ask natural-language questions about an indexed source document, with optional tool use for deterministic date arithmetic.

The current demo is built around an Enterprise HR Policy Handbook. In the current code, ingestion points to `Backend/Enterprise_HR_Policy_Handbook.pdf`; using a different document means replacing that file or updating the PDF path in `Backend/ingest.py`, then running ingestion again.

Live demo: https://docu-pilot-eta.vercel.app/

## Stack

- Frontend: React, Vite, Tailwind CSS, lucide-react
- Backend: FastAPI, Uvicorn
- AI: Google Gemini `gemini-2.5-flash`
- Embeddings: Google Gemini `gemini-embedding-001`
- Retrieval: LangChain + Chroma
- Deployment: Vercel frontend, Render backend

Note: the Render backend may sleep on the free tier. The first request after inactivity can take 30-60 seconds while the service wakes up.

## What It Solves

General chatbots can confidently answer questions about private company documents they have never seen. DocuPilot reduces that risk by retrieving relevant source text first and letting Gemini use that retrieved context while answering.

The current use case is HR policy Q&A, where wrong answers can matter. For example, an employee asking about paid annual leave may need both policy lookup and date calculation. DocuPilot handles policy retrieval through the vector store and exposes a deterministic date calculation tool for arithmetic.

## How It Works

### Ingestion

1. `Backend/ingest.py` loads `Backend/Enterprise_HR_Policy_Handbook.pdf`.
2. The PDF is split into overlapping text chunks.
3. Each chunk is embedded with `gemini-embedding-001`.
4. The chunk vectors are persisted to `Backend/chroma_db`.

Current chunking configuration:

- `chunk_size=1000`
- `chunk_overlap=200`

### Query Time

1. The user sends a message from the React chat UI.
2. The frontend posts the question and chat history to `POST /api/ask`.
3. FastAPI creates a Gemini chat session with tool calling enabled.
4. Gemini can call `search_hr_policy(query)` to retrieve the most relevant Chroma passage.
5. Gemini can call `calculate_days_between(start_date, end_date)` for date arithmetic.
6. The backend returns the final answer to the frontend.
7. The frontend renders the answer in the chat window.

Flow:

```text
PDF -> chunks -> embeddings -> Chroma vector store

User question -> /api/ask -> Gemini chat with tools
                              |
                              +-> search_hr_policy() -> Chroma similarity search
                              +-> calculate_days_between() -> deterministic date math
                              |
                              v
                         final answer
```

## Project Structure

```text
DocuPilot/
+-- Backend/
|   +-- main.py                         # FastAPI app and API routes
|   +-- ingest.py                       # PDF ingestion into Chroma
|   +-- agent.py                        # CLI/demo agent runner
|   +-- requirements.txt                # Backend dependencies
|   +-- .env.example                    # Backend environment template
|   +-- Enterprise_HR_Policy_Handbook.pdf
+-- Frontend/
|   +-- src/
|   |   +-- components/                 # Chat UI components
|   |   +-- hooks/                      # Chat/session hooks
|   |   +-- services/api.js             # Backend API client
|   +-- package.json
|   +-- .env.example
+-- Frontend-temp/                      # Older static prototype
+-- specs/                              # Feature specs and contracts
```

## API Overview

### `GET /api/health`

Returns backend health.

```json
{
  "status": "ok"
}
```

### `POST /api/ask`

Answers a question with optional chat history.

Request:

```json
{
  "question": "How many days of annual leave do I get?",
  "history": [
    {
      "role": "user",
      "text": "Previous user message"
    },
    {
      "role": "model",
      "text": "Previous assistant message"
    }
  ]
}
```

Response:

```json
{
  "answer": "string",
  "source_context": "Agent orchestrated tools to answer this request."
}
```

### `GET /api/history`

Loads chat history from the backend's local `chat_history.json` file.

### `POST /api/history`

Saves chat history to the backend's local `chat_history.json` file.

## Running Locally

### Backend

```bash
cd Backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Set your Gemini API key in `Backend/.env`:

```env
GEMINI_API_KEY=your_key_here
```

The backend serves API docs at:

```text
http://127.0.0.1:8000/docs
```

There is also a `Backend/run.ps1` helper, but it currently points to a machine-specific Python path. Use the `uvicorn` command above unless that path matches your local setup.

### Frontend

```bash
cd Frontend
npm install
copy .env.example .env
npm run dev
```

Set the frontend API URL in `Frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

The Vite dev server usually runs at:

```text
http://localhost:5173
```

## Usage

Open the frontend, ask a question about the HR policy, and wait for DocuPilot to answer from the indexed document.

The app has a UI toggle in the top-right corner:

- `New`: current React chat interface
- `Old`: older chat UI preserved for comparison/demo use

Use the clear chat button to reset the conversation. Chat history is also synced through the backend history endpoints.

## Environment Variables

Backend:

```env
GEMINI_API_KEY=your_key_here
CORS_ORIGINS=http://localhost:5173
```

Frontend:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Known Limitations

- The demo uses one pre-loaded PDF and does not include a user-facing document upload flow.
- Retrieval currently returns the top matching passage with `k=1`.
- Chat history is saved to a local JSON file, not a database.
- There is no formal eval set yet for retrieval quality, out-of-document behavior, or tool argument correctness.
- There is no persistent observability for questions, retrieved chunks, tool calls, and final answers.
- Repeated questions are not cached, so each answer can incur embedding and generation cost.

## Documentation

- Backend details: `Backend/README.md`
- Frontend code: `Frontend/`
- Feature specs: `specs/001-react-chat-interface/`
