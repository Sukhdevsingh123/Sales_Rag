import time

from pinecone import (
    Pinecone,
    ServerlessSpec
)

from app.sales_rag.config import (
    PINECONE_API_KEY,
    PINECONE_INDEX,
    EMBEDDING_DIMENSION
)


def get_pinecone_client():

    if not PINECONE_API_KEY:
        raise ValueError(
            "PINECONE_API_KEY missing in .env"
        )

    return Pinecone(
        api_key=PINECONE_API_KEY
    )


def create_index_if_not_exists():

    pc = get_pinecone_client()

    existing_indexes = [

        index["name"]

        for index in pc.list_indexes()
    ]

    if PINECONE_INDEX in existing_indexes:

        print(
            f"✅ Index already exists: {PINECONE_INDEX}"
        )

        return

    print(
        f"🚀 Creating Pinecone Index: {PINECONE_INDEX}"
    )

    pc.create_index(
        name=PINECONE_INDEX,
        dimension=EMBEDDING_DIMENSION,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )

    print(
        "⏳ Waiting for index..."
    )

    while not pc.describe_index(
        PINECONE_INDEX
    ).status["ready"]:

        time.sleep(2)

    print(
        "✅ Pinecone Index Ready"
    )


def get_index():

    create_index_if_not_exists()

    pc = get_pinecone_client()

    return pc.Index(
        PINECONE_INDEX
    )