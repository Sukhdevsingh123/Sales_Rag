import os

from dotenv import load_dotenv

load_dotenv()


PINECONE_API_KEY = os.getenv(
    "PINECONE_API_KEY"
)

PINECONE_INDEX = os.getenv(
    "PINECONE_INDEX",
    "pdf-rag"
)

EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL",
    "BAAI/bge-m3"
)

LLM_MODEL = os.getenv(
    "LLM_MODEL",
    "qwen3.5:27b"
)

OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://localhost:11434"
)

# BAAI/bge-m3 embedding dimension
EMBEDDING_DIMENSION = 1024