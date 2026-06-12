import os
import logging
from datetime import datetime
from functools import lru_cache
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings
from pydantic import BaseModel, Field


load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
CHROMA_PERSIST_DIR = BASE_DIR / "chroma_db"
EMBEDDING_MODEL = "gemini-embedding-001"
GENERATION_MODEL = "gemini-2.5-flash"
ASK_ERROR_MESSAGE = "Sorry, I could not answer that right now. Please try again in a moment."
EMPTY_MODEL_RESPONSE_MESSAGE = "Sorry, I did not receive a usable answer. Please try asking again."

logger = logging.getLogger(__name__)


class Message(BaseModel):
    role: str
    text: str


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1, description="User question to answer.")
    history: list[Message] = Field(default_factory=list)


class AskResponse(BaseModel):
    answer: str
    source_context: str


class HealthResponse(BaseModel):
    status: str


class ErrorResponse(BaseModel):
    detail: str


class GoogleGenAIEmbeddings(Embeddings):
    """LangChain-compatible embeddings backed by the official google-genai SDK."""

    def __init__(self, api_key: str, model: str = EMBEDDING_MODEL) -> None:
        self.client = genai.Client(api_key=api_key)
        self.model = model

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self._embed(texts, task_type="RETRIEVAL_DOCUMENT")

    def embed_query(self, text: str) -> list[float]:
        return self._embed([text], task_type="RETRIEVAL_QUERY")[0]

    def _embed(self, texts: list[str], task_type: str) -> list[list[float]]:
        if not texts:
            return []

        response = self.client.models.embed_content(
            model=self.model,
            contents=texts,
            config=types.EmbedContentConfig(task_type=task_type),
        )

        embeddings = getattr(response, "embeddings", None)
        if not embeddings:
            raise RuntimeError("Gemini embedding response did not include embeddings.")

        return [self._extract_values(embedding) for embedding in embeddings]

    @staticmethod
    def _extract_values(embedding: Any) -> list[float]:
        values = getattr(embedding, "values", None)
        if values is None and isinstance(embedding, dict):
            values = embedding.get("values")
        if values is None:
            raise RuntimeError("Gemini embedding item did not include vector values.")
        return [float(value) for value in values]


app = FastAPI(title="DocuPilot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatHistory(BaseModel):
    messages: list[Message]


CHAT_HISTORY_FILE = BASE_DIR / "chat_history.json"


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.get("/api/history", response_model=ChatHistory)
def get_history() -> ChatHistory:
    """Retrieve chat history from the local JSON file."""
    if CHAT_HISTORY_FILE.exists():
        try:
            with open(CHAT_HISTORY_FILE, "r") as f:
                import json
                data = json.load(f)
                return ChatHistory(messages=data.get("messages", []))
        except Exception:
            return ChatHistory(messages=[])
    return ChatHistory(messages=[])


@app.post("/api/history")
def save_history(history: ChatHistory):
    """Save chat history to the local JSON file."""
    try:
        with open(CHAT_HISTORY_FILE, "w") as f:
            import json
            json.dump(history.model_dump(), f)
        return {"status": "success"}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save history: {exc}",
        )


def _get_api_key() -> str:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API key is not configured. Set GEMINI_API_KEY in .env.",
        )
    return api_key


def get_genai_client() -> genai.Client:
    return genai.Client(api_key=_get_api_key())


@lru_cache(maxsize=1)
def get_vector_store() -> Chroma:
    api_key = _get_api_key()

    if not os.path.isdir(CHROMA_PERSIST_DIR):
        try:
            from ingest import ingest_pdf

            ingest_pdf()
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Chroma database not found and automatic ingestion failed: {exc}",
            ) from exc

    embeddings = GoogleGenAIEmbeddings(api_key=api_key)
    return Chroma(
        persist_directory=str(CHROMA_PERSIST_DIR),
        embedding_function=embeddings,
    )


def calculate_days_between(start_date: str, end_date: str) -> int:
    """Return the whole number of days between two dates formatted as YYYY-MM-DD.

    Args:
        start_date: The starting date in YYYY-MM-DD format.
        end_date: The ending date in YYYY-MM-DD format.

    Returns:
        The integer number of days from start_date to end_date.

    Raises:
        ValueError: If either date is not formatted as YYYY-MM-DD.
    """
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()
    return (end - start).days


def search_hr_policy(query: str) -> str:
    """Search the local HR policy vector store and return the top matching passage."""
    vector_store = get_vector_store()
    documents = vector_store.similarity_search(query, k=1)
    if not documents:
        raise RuntimeError("No matching context found in the local Chroma database.")
    return documents[0].page_content


@app.post(
    "/api/ask",
    response_model=AskResponse,
    responses={
        400: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
def ask(request: AskRequest) -> AskResponse:
    question = request.question.strip()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty.",
        )

    try:
        history_contents = [
            types.Content(
                role=msg.role,
                parts=[types.Part.from_text(text=msg.text)],
            )
            for msg in request.history
        ]

        client = get_genai_client()
        chat = client.chats.create(
            model=GENERATION_MODEL,
            history=history_contents,
            config=types.GenerateContentConfig(
                tools=[search_hr_policy, calculate_days_between],
            ),
        )
        response = chat.send_message(question)

        answer = (getattr(response, "text", None) or "").strip()
        if not answer:
            logger.warning("Gemini response did not include answer text.")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=EMPTY_MODEL_RESPONSE_MESSAGE,
            )

        return AskResponse(
            answer=answer,
            source_context="Agent orchestrated tools to answer this request.",
        )
    except HTTPException as exc:
        if exc.status_code in {
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_502_BAD_GATEWAY,
        }:
            raise
        logger.exception("Failed to answer question.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ASK_ERROR_MESSAGE,
        ) from exc
    except ValueError as exc:
        logger.warning("Invalid ask request: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please check your question and try again.",
        ) from exc
    except Exception as exc:
        logger.exception("Failed to answer question.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ASK_ERROR_MESSAGE,
        ) from exc
