from app.sales_rag.vector_db.pinecone_db import (
    create_index_if_not_exists,
    get_index
)

create_index_if_not_exists()

index = get_index()

print(index.describe_index_stats())