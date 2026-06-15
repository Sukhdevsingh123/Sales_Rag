from langchain_core.documents import Document
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter
)


def create_documents(
    normalized_docs
):

    documents = []

    for doc in normalized_docs:

        documents.append(

            Document(

                page_content=
                doc.get(
                    "combined_text",
                    ""
                ),

                metadata={

                    "file_name":
                    doc.get(
                        "file_name",
                        ""
                    ),

                    "page":
                    doc.get(
                        "page",
                        0
                    ),

                    "section":
                    doc.get(
                        "section",
                        ""
                    ),

                    "total_pages":
                    doc.get(
                        "total_pages",
                        0
                    )
                }
            )
        )

    return documents

def create_chunks(
    documents
):

    splitter = (
        RecursiveCharacterTextSplitter(

            chunk_size=800,

            chunk_overlap=150,

            separators=[
                "\n\n",
                "\n",
                ". ",
                " ",
                ""
            ]
        )
    )

    chunks = splitter.split_documents(
        documents
    )

    for idx, chunk in enumerate(chunks):

        chunk.metadata[
            "chunk_id"
        ] = idx

        chunk.metadata[
            "text"
        ] = chunk.page_content

    return chunks