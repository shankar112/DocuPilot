import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from google import genai
from google.genai import types
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.embeddings import Embeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter


BASE_DIR = Path(__file__).resolve().parent
PDF_PATH = BASE_DIR / "Enterprise_HR_Policy_Handbook.pdf"
CHROMA_PERSIST_DIR = BASE_DIR / "chroma_db"
EMBEDDING_MODEL = "gemini-embedding-001"


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


def get_api_key() -> str:
    load_dotenv(BASE_DIR / ".env")
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise RuntimeError("Gemini API key is not configured. Set GEMINI_API_KEY in Backend/.env.")
    return api_key


def ingest_pdf() -> int:
    if not PDF_PATH.is_file():
        raise FileNotFoundError(f"PDF file not found: {PDF_PATH}")

    loader = PyPDFLoader(str(PDF_PATH))
    documents = loader.load()
    if not documents:
        raise RuntimeError(f"No documents were loaded from {PDF_PATH.name}.")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )
    chunks = splitter.split_documents(documents)
    if not chunks:
        raise RuntimeError("PDF was loaded but no text chunks were created.")

    embeddings = GoogleGenAIEmbeddings(api_key=get_api_key())
    ids = [f"{PDF_PATH.stem}-chunk-{index}" for index in range(len(chunks))]

    Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        ids=ids,
        persist_directory=str(CHROMA_PERSIST_DIR),
    )

    return len(chunks)


def main() -> None:
    try:
        chunk_count = ingest_pdf()
        print(f"Success: saved {chunk_count} chunks to Chroma database at {CHROMA_PERSIST_DIR}.")
    except Exception as exc:
        raise SystemExit(f"Error: {exc}") from exc


if __name__ == "__main__":
    main()
