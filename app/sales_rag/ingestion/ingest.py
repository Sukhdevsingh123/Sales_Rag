import json

from app.sales_rag.chunking.splitter import (
    create_documents,
    create_chunks
)

from app.sales_rag.vector_db.vector_store import (
    store_chunks
)


def ingest_normalized_file(
    normalized_json_path: str
):
    """
    normalized.json
      ↓
    documents
      ↓
    chunks
      ↓
    embeddings
      ↓
    pinecone
    """

    with open(
        normalized_json_path,
        "r",
        encoding="utf-8"
    ) as f:

        normalized_docs = json.load(f)

    documents = create_documents(
        normalized_docs
    )

    chunks = create_chunks(
        documents
    )

    store_chunks(
        chunks
    )

    return {
        "documents": len(documents),
        "chunks": len(chunks)
    }