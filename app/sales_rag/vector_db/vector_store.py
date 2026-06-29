# import hashlib
# from app.sales_rag.vector_db.pinecone_db import (
#     get_index
# )

# from app.sales_rag.embeddings.bge_m3 import (
#     embed_texts
# )


# def generate_vector_id(metadata):

#     unique_text = (
#         f"{metadata.get('file_name','')}_"
#         f"{metadata.get('page','')}_"
#         f"{metadata.get('chunk_id','')}"
#     )

#     return hashlib.md5(
#         unique_text.encode()
#     ).hexdigest()
    
    
    
# def store_chunks(
#     chunks
# ):

#     index = get_index()

#     texts = [
#         chunk.page_content
#         for chunk in chunks
#     ]

#     embeddings = embed_texts(
#         texts
#     )

#     vectors = []

#     for chunk, embedding in zip(
#         chunks,
#         embeddings
#     ):

#         vectors.append({

#             "id":
#             generate_vector_id(
#                 chunk.metadata
#             ),

#             "values":
#             embedding,

#             "metadata": {

#                 "text":
#                 chunk.page_content,

#                 "file_name":
#                 chunk.metadata.get(
#                     "file_name"
#                 ),

#                 "page":
#                 str(
#                     chunk.metadata.get(
#                         "page"
#                     )
#                 ),

#                 "section":
#                 chunk.metadata.get(
#                     "section"
#                 ),

#                 "chunk_id":
#                 str(
#                     chunk.metadata.get(
#                         "chunk_id"
#                     )
#                 )
#             }
#         })

#     index.upsert(
#         vectors=vectors
#     )

#     print(
#         f"Stored "
#         f"{len(vectors)} vectors"
#     )
    
#     print(
#     "VECTOR ID:",
#     generate_vector_id(
#         chunk.metadata
#     )
# )








import hashlib

from app.sales_rag.vector_db.pinecone_db import (
    get_vector_store,
)

from app.sales_rag.embeddings.bge_m3 import (
    embed_texts,
)


def generate_vector_id(metadata):

    return hashlib.md5(

        f"{metadata.get('file_name','')}_"
        f"{metadata.get('page','')}_"
        f"{metadata.get('chunk_id','')}"

        .encode()

    ).hexdigest()


def store_chunks(chunks):

    vector_store = get_vector_store()

    index = vector_store.index

    texts = [
        chunk.page_content
        for chunk in chunks
    ]

    embeddings = embed_texts(
        texts
    )

    vectors = []

    for chunk, embedding in zip(
        chunks,
        embeddings,
    ):

        vectors.append(

            {

                "id":
                generate_vector_id(
                    chunk.metadata
                ),

                "values":
                embedding,

                "metadata": {

                    "text":
                    chunk.page_content,

                    "file_name":
                    chunk.metadata.get(
                        "file_name"
                    ),

                    "page":
                    str(
                        chunk.metadata.get(
                            "page"
                        )
                    ),

                    "section":
                    chunk.metadata.get(
                        "section"
                    ),

                    "chunk_id":
                    str(
                        chunk.metadata.get(
                            "chunk_id"
                        )
                    ),

                },

            }

        )

    index.upsert(
        vectors=vectors
    )

    print(
        f"Stored {len(vectors)} vectors"
    )