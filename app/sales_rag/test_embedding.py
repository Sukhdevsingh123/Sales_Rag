from app.sales_rag.embeddings.bge_m3 import (
    embed_query
)

vector = embed_query(
    "What is AFF A90?"
)

print(
    len(vector)
)

print(
    vector[:5]
)