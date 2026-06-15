from collections import defaultdict

from app.sales_rag.vector_db.pinecone_db import (
    get_index
)

from app.sales_rag.embeddings.bge_m3 import (
    embed_query
)


def search_chunks(
    query,
    top_k=5
):

    index = get_index()

    query_vector = embed_query(
        query
    )

    results = index.query(
        vector=query_vector,
        top_k=20,         
        include_metadata=True
    )

    page_counter = defaultdict(int)

    filtered = []
    for match in results.matches:
        page = match.metadata.get("page")

        # normalize page key for counting
        if page is None:
            page = "_"

        if page_counter[page] < 2:
            filtered.append(match)
            page_counter[page] += 1

        if len(filtered) >= top_k:
            break

    return filtered




def build_context(matches):

    context_parts = []

    for match in matches:

        text = match.metadata.get(
            "text",
            ""
        )

        page = match.metadata.get(
            "page",
            ""
        )

        section = match.metadata.get(
            "section",
            ""
        )

        context_parts.append(

            f"""
Page: {page}
Section: {section}

{text}
"""
        )

    return "\n\n".join(
        context_parts
    )