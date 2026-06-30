# from app.sales_rag.retrieval.retriever import (
#     search_chunks,
#     build_context
# )

# from app.sales_rag.llm.ollama_llm import (
#     generate_answer
# )


# def ask_question(
#     question,
#     top_k=5
# ):

#     matches = search_chunks(
#         question,
#         top_k
#     )

#     context = build_context(
#         matches
#     )

#     answer = generate_answer(
#         question,
#         context
#     )

#     sources = []

#     for match in matches:

#         sources.append({

#             "score": float(
#                 match.score
#             ),

#             "page":
#             match.metadata.get(
#                 "page"
#             ),

#             "section":
#             match.metadata.get(
#                 "section"
#             ),

#             "file_name":
#             match.metadata.get(
#                 "file_name"
#             ),

#             "chunk_id":
#             match.metadata.get(
#                 "chunk_id"
#             )

#         })

#     return answer     


    # return answer, sources
    
    
    
    
    
    
    
    
    
    
    
    
    
    
from app.sales_rag.graph.graph import _graph


def ask_question(
    question: str,
    top_k: int = 5,
    user_id: str = None,
    conversation_id: str = None,
):

    if _graph is None:
        raise RuntimeError(
            "LangGraph is not initialized."
        )
    thread_id = f"{user_id}_{conversation_id}"
    result = _graph.invoke(
        {
            "question": question,
            "context": "",
            "answer": "",
            "summary": "",
            "top_k": top_k,
        
        },
        config={
        "configurable": {
            "thread_id": thread_id,
        }
    },
    )

    answer = result["answer"]

    def stream():

        for ch in answer:
            yield ch

    return stream()