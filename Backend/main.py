import os
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


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1, description="User question to answer.")


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
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


def _get_api_key() -> str:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API key is not configured. Set GEMINI_API_KEY in .env.",
        )
    return api_key


@lru_cache(maxsize=1)
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


def _build_prompt(source_context: str, question: str) -> str:
    return (
        "You are DocuPilot, a precise assistant answering from retrieved context.\n"
        "Use only the context when possible. If the answer is not in the context, "
        "say that the provided context does not contain enough information.\n\n"
        f"Context:\n{source_context}\n\n"
        f"Question:\n{question}\n\n"
        "Answer:"
    )


@app.post(
    "/api/ask",
    response_model=AskResponse,
    responses={
        400: {"model": ErrorResponse},
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
        vector_store = get_vector_store()
        documents = vector_store.similarity_search(question, k=1)
        if not documents:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No matching context found in the local Chroma database.",
            )

        source_context = documents[0].page_content
        prompt = _build_prompt(source_context=source_context, question=question)
        response = get_genai_client().models.generate_content(
            model=GENERATION_MODEL,
            contents=prompt,
        )

        answer = (getattr(response, "text", None) or "").strip()
        if not answer:
            raise RuntimeError("Gemini response did not include answer text.")

        return AskResponse(answer=answer, source_context=source_context)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to answer question: {exc}",
        ) from exc
