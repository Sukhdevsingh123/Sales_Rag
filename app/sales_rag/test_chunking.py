import json

from app.sales_rag.chunking.splitter import (
    create_documents,
    create_chunks
)

FILE_PATH = (
    "output/"
    "NetApp-DS-3582-1225-AFF-A-Series_normalized.json"
)

with open(
    FILE_PATH,
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

print(
    f"Documents: {len(documents)}"
)

print(
    f"Chunks: {len(chunks)}"
)

print(
    "\nSample Chunk:\n"
)
for chunk in chunks:

    print("\n" + "=" * 80)

    print(
        f"Chunk ID : {chunk.metadata['chunk_id']}"
    )

    print(
        f"Page : {chunk.metadata['page']}"
    )

    print(
        f"Section : {chunk.metadata['section']}"
    )

    print("\nContent:\n")

    print(chunk.page_content)

    print("\n")