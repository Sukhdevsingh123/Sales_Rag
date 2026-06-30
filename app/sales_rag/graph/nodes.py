from langchain_core.messages import (
    HumanMessage,
    AIMessage,
)

from app.sales_rag.graph.state import GraphState

from app.sales_rag.retrieval.retriever import (
    search_chunks,
    build_context,
)

from app.sales_rag.llm.ollama_llm import (
    generate_answer,
    rewrite_question,
)


def rewrite_node(state: GraphState) -> GraphState:
    """
    Rewrite follow-up question into a standalone question.
    """

    standalone = rewrite_question(
        question=state["question"],
        messages=state.get("messages", []),
    )

    print("Original Question :", state["question"])
    print("Standalone Question :", standalone)

    return {
        "standalone_question": standalone,
    }
    

def retrieve_node(state: GraphState) -> GraphState:
    """
    Retrieve relevant document chunks from Pinecone.
    """

    matches = search_chunks(
        state["standalone_question"],
        state["top_k"],
    )

    context = build_context(matches)

    return {
        "context": context,
    }


def llm_node(state: GraphState) -> GraphState:
    """
    Generate answer.
    Save Human + AI messages into LangGraph memory.
    """
    print("Messages:", state.get("messages"))
    stream = generate_answer(
    question=state["question"],
    context=state["context"],
    summary=state.get("summary", ""),
    messages=state.get("messages", []),
)

    answer = ""

    for token in stream:
        answer += token

    return {
        "answer": answer,
        "messages": [
            HumanMessage(
                content=state["question"]
            ),
            AIMessage(
                content=answer
            ),
        ],
    }