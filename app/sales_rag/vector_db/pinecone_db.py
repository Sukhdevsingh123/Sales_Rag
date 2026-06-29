# import time

# from pinecone import (
#     Pinecone,
#     ServerlessSpec
# )

# from app.sales_rag.config import (
#     PINECONE_API_KEY,
#     PINECONE_INDEX,
#     EMBEDDING_DIMENSION
# )


# def get_pinecone_client():

#     if not PINECONE_API_KEY:
#         raise ValueError(
#             "PINECONE_API_KEY missing in .env"
#         )

#     return Pinecone(
#         api_key=PINECONE_API_KEY
#     )


# def create_index_if_not_exists():

#     pc = get_pinecone_client()

#     existing_indexes = [

#         index["name"]

#         for index in pc.list_indexes()
#     ]

#     if PINECONE_INDEX in existing_indexes:

#         print(
#             f"✅ Index already exists: {PINECONE_INDEX}"
#         )

#         return

#     print(
#         f"🚀 Creating Pinecone Index: {PINECONE_INDEX}"
#     )

#     pc.create_index(
#         name=PINECONE_INDEX,
#         dimension=EMBEDDING_DIMENSION,
#         metric="cosine",
#         spec=ServerlessSpec(
#             cloud="aws",
#             region="us-east-1"
#         )
#     )

#     print(
#         "⏳ Waiting for index..."
#     )

#     while not pc.describe_index(
#         PINECONE_INDEX
#     ).status["ready"]:

#         time.sleep(2)

#     print(
#         "✅ Pinecone Index Ready"
#     )


# def get_index():

#     create_index_if_not_exists()

#     pc = get_pinecone_client()

#     return pc.Index(
#         PINECONE_INDEX
#     )





from pinecone import (
    Pinecone,
    ServerlessSpec,
)

from langchain_pinecone import (
    PineconeVectorStore,
)

from app.sales_rag.config import (
    PINECONE_API_KEY,
    PINECONE_INDEX,
    EMBEDDING_DIMENSION,
)

from app.sales_rag.embeddings.bge_m3 import (
    get_embedding_model,
)

import time

_pc = None
_index = None
_vector_store = None


def get_pinecone_client():
    global _pc

    if _pc is None:

        if not PINECONE_API_KEY:
            raise ValueError(
                "PINECONE_API_KEY missing"
            )

        _pc = Pinecone(
            api_key=PINECONE_API_KEY
        )

    return _pc


def create_index_if_not_exists():

    pc = get_pinecone_client()

    indexes = [
        idx["name"]
        for idx in pc.list_indexes()
    ]

    if PINECONE_INDEX in indexes:

        print(
            f"✅ Index already exists: {PINECONE_INDEX}"
        )

        return

    print(
        f"Creating {PINECONE_INDEX}"
    )

    pc.create_index(
        name=PINECONE_INDEX,
        dimension=EMBEDDING_DIMENSION,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1",
        ),
    )

    while not pc.describe_index(
        PINECONE_INDEX
    ).status["ready"]:

        time.sleep(2)

    print("Index Ready")


def get_index():

    global _index

    if _index is None:

        create_index_if_not_exists()

        _index = (
            get_pinecone_client()
            .Index(PINECONE_INDEX)
        )

    return _index


def get_vector_store():

    global _vector_store

    if _vector_store is None:

        _vector_store = PineconeVectorStore(
            index=get_index(),
            embedding=get_embedding_model(),
        )

    return _vector_store