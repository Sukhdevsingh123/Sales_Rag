from app.sales_rag.pipeline.rag_pipeline import ask_question

result = ask_question(
    "What is the maximum effective capacity of AFF A90?"
)

print(result["answer"])