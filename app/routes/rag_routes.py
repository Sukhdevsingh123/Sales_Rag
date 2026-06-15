from fastapi import APIRouter
from pydantic import BaseModel

from app.sales_rag.pipeline.rag_pipeline import (
    ask_question
)

router = APIRouter(
    prefix="/rag",
    tags=["RAG"]
)


class AskRequest(BaseModel):

    question: str
    

@router.post("/ask")
def ask(
    request: AskRequest
):

    result = ask_question(
        request.question
    )

    return {

        "question":
        request.question,

        "answer":
        result["answer"],

        "sources":
        result["sources"]
    }