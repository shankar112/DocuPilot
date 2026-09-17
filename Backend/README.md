# DocuPilot Backend

This folder contains the FastAPI service for DocuPilot. It handles PDF ingestion, vector retrieval, Gemini tool calling, chat answering, and simple chat-history persistence.

## Responsibilities

- Ingest the source PDF into a local Chroma vector store.
- Embed document chunks with Gemini embeddings.
- Search the vector store for relevant HR policy context.
- Use Gemini `gemini-2.5-flash` to answer user questions.
- Expose a date calculation tool for deterministic arithmetic.
- Provide REST API endpoints consumed by the React frontend.

## Main Files

```text
Backend/
+-- main.py                         # FastAPI app, API routes, Gemini tool setup
+-- ingest.py                       # PDF loading, chunking, embedding, Chroma persistence
+-- agent.py                        # Standalone CLI/demo runner for the same tool flow
+-- requirements.txt                # Python dependencies
+-- run.ps1                         # Local Windows uvicorn launcher
+-- .env.example                    # Environment variable template
+-- Enterprise_HR_Policy_Handbook.pdf
```

Generated/runtime files:

```text
Backend/chroma_db/                  # Local Chroma vector database
Backend/chat_history.json           # Local chat history store
```

## Pipeline

### Ingestion

`ingest.py` performs the document indexing step:

```text
PDF -> PyPDFLoader -> text chunks -> Gemini embeddings -> Chroma
```

Current settings:

- Source PDF: `Enterprise_HR_Policy_Handbook.pdf`
- Embedding model: `gemini-embedding-001`
- Chunk size: `1000`
- Chunk overlap: `200`
- Persist directory: `Backend/chroma_db`

The source PDF path is currently defined in code as `PDF_PATH = BASE_DIR / "Enterprise_HR_Policy_Handbook.pdf"`.

Run ingestion manually:

```bash
python ingest.py
```

The API can also attempt ingestion automatically if `chroma_db` is missing when `search_hr_policy()` is first needed.

### Query Flow

`main.py` handles the runtime chat path:

```text
POST /api/ask
  -> validate question
  -> convert prior messages into Gemini chat history
  -> create Gemini chat with tools
  -> Gemini may call search_hr_policy(query)
  -> Gemini may call calculate_days_between(start_date, end_date)
  -> return final answer
```

The available tools are:

- `search_hr_policy(query: str) -> str`
- `calculate_days_between(start_date: str, end_date: str) -> int`

## Configuration

Create a `.env` file in `Backend/`:

```bash
copy .env.example .env
```

Required:

```env
GEMINI_API_KEY=your_key_here
```

Optional:

```env
CORS_ORIGINS=http://localhost:5173
```

`GOOGLE_API_KEY` is also accepted by the code as a fallback, but `GEMINI_API_KEY` is the preferred name.

## Running Locally

From `Backend/`:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Or run the included PowerShell script:

```powershell
.\run.ps1
```

Note: `run.ps1` currently uses a machine-specific Python path. If that path does not exist on your system, run the `uvicorn` command above or update the script.

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API docs:

```text
http://127.0.0.1:8000/docs
```

## API Endpoints

### `GET /api/health`

Returns:

```json
{
  "status": "ok"
}
```

### `POST /api/ask`

Request:

```json
{
  "question": "How many days of paid annual leave do I get?",
  "history": [
    {
      "role": "user",
      "text": "Previous user message"
    },
    {
      "role": "model",
      "text": "Previous model response"
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

Reads chat history from `Backend/chat_history.json`. If the file is missing or invalid, the API returns an empty message list.

### `POST /api/history`

Writes chat history to `Backend/chat_history.json`.

Request:

```json
{
  "messages": [
    {
      "role": "user",
      "text": "Hello"
    },
    {
      "role": "model",
      "text": "Hi, how can I help?"
    }
  ]
}
```

## CORS

The backend allows these origins by default:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `https://docu-pilot-eta.vercel.app`

Add more origins with comma-separated `CORS_ORIGINS`.

## Notes and Limitations

- The current retrieval function uses `k=1`, so only the top matching passage is returned.
- Tool calling depends on Gemini choosing when to call the retrieval/date tools.
- Date arithmetic is deterministic once arguments are passed, but the model can still pass incorrect dates if it misreads the question.
- Chat history is stored in a local JSON file, which is suitable for a demo but not production.
- There is no formal eval set yet for retrieval quality, out-of-document refusal behavior, or tool argument validation.
- There is no persistent request tracing for question, retrieved chunk, tool calls, and final answer.
