import json

from app.sales_rag.chunking.splitter import (
    create_documents,
    create_chunks
)

from app.sales_rag.vector_db.vector_store import (
    store_chunks
)

with open(
    "output/NetApp-DS-3582-1225-AFF-A-Series_normalized.json",
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

