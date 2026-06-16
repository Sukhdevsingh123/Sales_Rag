from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.sales_rag.pipeline.rag_pipeline import (
    ask_question
)

from app.core.dependencies import require_user
from app.core.database import get_db
from app.core.models import User

router = APIRouter(
    prefix="/rag",
    tags=["RAG"]
)


class AskRequest(BaseModel):
    question: str
    

@router.post("/ask")
def ask(
    request: AskRequest,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """Ask a question to RAG (authenticated users only)."""
    result = ask_question(
        request.question
    )

    return {
        "question":
        request.question,

        "answer":
        result["answer"],

        "sources":
        result["sources"],
        
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "role": current_user.role
        }
    }