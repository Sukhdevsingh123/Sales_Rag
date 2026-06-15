from app.sales_rag.vector_db.pinecone_db import (
    get_index
)

index = get_index()

print(
    index.describe_index_stats()
)