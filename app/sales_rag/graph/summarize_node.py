from app.sales_rag.graph.state import GraphState

from app.sales_rag.llm.ollama_llm import (
    summarize_messages,
)


MAX_MESSAGES = 12
KEEP_LAST_MESSAGES = 4


def summarize_node(state: GraphState) -> GraphState:
    """
    Summarize long conversations.

    If conversation is short,
    do nothing.

    If conversation is long:

        summary += old messages

    Keep only recent messages.
    """

    messages = state.get("messages", [])

    # No need to summarize yet
    if len(messages) <= MAX_MESSAGES:
        return {}
    
    # Debug
    print("\n==============================")
    print("Summarizing...", len(messages), "messages")
    print("==============================")


    summary = summarize_messages(
        summary=state.get("summary", ""),
        messages=messages[:-KEEP_LAST_MESSAGES],
    )
    print("Summary Updated")
    print(summary)
    print("==============================\n")

    return {
        "summary": summary,
        "messages": messages[-KEEP_LAST_MESSAGES:],
    }
    
    