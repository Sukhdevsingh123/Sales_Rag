from langgraph.graph import END

from app.sales_rag.graph.state import GraphState


SUMMARY_THRESHOLD = 12


def should_summarize(state: GraphState):

    messages = state.get("messages", [])

    if len(messages) > SUMMARY_THRESHOLD:
        return "summarize"

    return END