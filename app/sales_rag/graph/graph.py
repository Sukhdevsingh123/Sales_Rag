from langgraph.graph import (
    StateGraph,
    START,
    END,
)

from app.sales_rag.graph.state import GraphState

from app.sales_rag.graph.nodes import (
    rewrite_node,
    retrieve_node,
    llm_node,
)

from app.sales_rag.graph.router import (
    should_summarize,
)

from app.sales_rag.graph.summarize_node import (
    summarize_node,
)
_graph = None


async def get_graph(checkpointer=None):
    """
    Build LangGraph only once.
    """

    global _graph

    if _graph is not None:
        return _graph

    builder = StateGraph(GraphState)

    # -------------------------
    # Nodes
    # -------------------------

    builder.add_node(
        "rewrite",
        rewrite_node,
    )

    builder.add_node(
        "retrieve",
        retrieve_node,
    )

    builder.add_node(
        "llm",
        llm_node,
    )

    builder.add_node(
        "summarize",
        summarize_node,
    )

    # -------------------------
    # Flow
    # -------------------------

    builder.add_edge(
        START,
        "rewrite",
    )

    builder.add_edge(
        "rewrite",
        "retrieve",
    )

    builder.add_edge(
        "retrieve",
        "llm",
    )

    builder.add_conditional_edges(
    "llm",
    should_summarize,
    {
        "summarize": "summarize",
        END: END,
    },
)
    
    builder.add_edge(
     "summarize",
     END,
    )

    _graph = builder.compile(
        checkpointer=checkpointer,
    )

    return _graph