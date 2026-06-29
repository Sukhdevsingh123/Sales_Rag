# from sentence_transformers import (
#     SentenceTransformer
# )

# from app.sales_rag.config import (
#     EMBEDDING_MODEL
# )


# _model = None


# def get_embedding_model():

#     global _model

#     if _model is None:

#         print(
#             f"Loading Embedding Model: "
#             f"{EMBEDDING_MODEL}"
#         )

#         _model = (
#             SentenceTransformer(
#                 EMBEDDING_MODEL
#             )
#         )

#         print(
#             "Embedding Model Loaded"
#         )

#     return _model


# def embed_texts(
#     texts
# ):

#     model = (
#         get_embedding_model()
#     )

#     embeddings = model.encode(
#         texts,
#         normalize_embeddings=True
#     )

#     return embeddings.tolist()


# def embed_query(
#     query
# ):

#     model = (
#         get_embedding_model()
#     )

#     embedding = model.encode(
#         query,
#         normalize_embeddings=True
#     )

#     return embedding.tolist()









from langchain_huggingface import HuggingFaceEmbeddings

from app.sales_rag.config import (
    EMBEDDING_MODEL
)

_model = None


def get_embedding_model():
    global _model

    if _model is None:

        print(
            f"Loading Embedding Model: {EMBEDDING_MODEL}"
        )

        _model = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL,
            encode_kwargs={
                "normalize_embeddings": True
            }
        )

        print("Embedding Model Loaded")

    return _model


def embed_texts(texts):

    model = get_embedding_model()

    return model.embed_documents(texts)


def embed_query(query):

    model = get_embedding_model()

    return model.embed_query(query)