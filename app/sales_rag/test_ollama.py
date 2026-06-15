from app.sales_rag.llm.ollama_llm import generate_answer

answer = generate_answer(
    question="What is ransomware protection?",
    context="""
NetApp AFF systems provide:

- Automatic ransomware protection
- Immutable snapshots
- Multifactor authentication
- SIEM/XDR integration
"""
)

print(answer)
