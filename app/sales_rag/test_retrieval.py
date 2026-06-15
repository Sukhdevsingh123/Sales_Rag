from app.sales_rag.retrieval.retriever import (
    search_chunks
)

query = (
    "What ransomware protection "
    "features are available?"
)

results = search_chunks(
    query=query,
    top_k=5
)

print("\nRESULTS\n")

for idx, match in enumerate(
    results,
    start=1
):

    print(
        f"\n========== "
        f"Result {idx}"
        f" =========="
    )

    print(
        f"Score: "
        f"{match.score}"
    )

    print(
        f"Page: "
        f"{match.metadata.get('page')}"
    )

    print(
        f"Section: "
        f"{match.metadata.get('section')}"
    )

    print(
        "\nText:\n"
    )

    print(
        match.metadata.get(
            "text",
            ""
        )[:1000]
    )