from app.sales_rag.ingestion.ingest import (
    ingest_normalized_file
)

result = ingest_normalized_file(
    "output/NetApp-DS-3582-1225-AFF-A-Series_normalized.json"
)

print(result)