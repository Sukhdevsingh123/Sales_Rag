from app.sales_rag.retrieval.retriever import (
    search_chunks,
    build_context
)

from app.sales_rag.llm.ollama_llm import (
    generate_answer
)


def ask_question(
    question,
    top_k=5
):

    matches = search_chunks(
        question,
        top_k
    )

    context = build_context(
        matches
    )

    answer = generate_answer(
        question,
        context
    )

    sources = []

    for match in matches:

        sources.append({

            "score": float(
                match.score
            ),

            "page":
            match.metadata.get(
                "page"
            ),

            "section":
            match.metadata.get(
                "section"
            ),

            "file_name":
            match.metadata.get(
                "file_name"
            ),

            "chunk_id":
            match.metadata.get(
                "chunk_id"
            )

        })

    return {

        "answer": answer,

        "sources": sources
    }