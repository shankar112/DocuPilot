import os
from datetime import datetime
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from google import genai
from google.genai import types
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings


BASE_DIR = Path(__file__).resolve().parent
CHROMA_PERSIST_DIR = BASE_DIR / "chroma_db"
EMBEDDING_MODEL = "gemini-embedding-001"
GENERATION_MODEL = "gemini-2.5-flash"
USER_MESSAGE = (
    "According to the HR policy, how many days of paid annual leave do I get? "
    "If I take a vacation from 2026-12-10 to 2026-12-25, how many days of my annual leave will I have left over?"
)


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
    """Load the Gemini API key from Backend/.env."""
    load_dotenv(BASE_DIR / ".env")
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise RuntimeError("Gemini API key is not configured. Set GEMINI_API_KEY in Backend/.env.")
    return api_key


def search_hr_policy(query: str) -> str:
    """Search the local HR policy Chroma database and return the top matching passage."""
    if not CHROMA_PERSIST_DIR.is_dir():
        raise FileNotFoundError(f"Chroma database not found at {CHROMA_PERSIST_DIR}.")

    embeddings = GoogleGenAIEmbeddings(api_key=get_api_key())
    vector_store = Chroma(
        persist_directory=str(CHROMA_PERSIST_DIR),
        embedding_function=embeddings,
    )
    documents = vector_store.similarity_search(query, k=1)
    if not documents:
        raise RuntimeError("No matching HR policy content was found.")
    return documents[0].page_content


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


def main() -> None:
    """Run the Gemini chat session with automatic tool calling enabled."""
    try:
        client = genai.Client(api_key=get_api_key())
        chat = client.chats.create(
            model=GENERATION_MODEL,
            config=types.GenerateContentConfig(
                tools=[search_hr_policy, calculate_days_between],
            ),
        )
        response = chat.send_message(USER_MESSAGE)
        final_text = (getattr(response, "text", None) or "").strip()
        if not final_text:
            raise RuntimeError("Gemini response did not include final text.")
        print(final_text)
    except Exception as exc:
        raise SystemExit(f"Error: {exc}") from exc


if __name__ == "__main__":
    main()
