from typing import Annotated
from typing_extensions import TypedDict

from langgraph.graph.message import add_messages
from langchain_core.messages import AnyMessage


class GraphState(TypedDict):

    question: str

    standalone_question: str

    context: str

    answer: str

    top_k: int

    summary: str
    
    

    messages: Annotated[
        list[AnyMessage],
        add_messages,
    ]