from pydantic import BaseModel
from typing import List, Dict, Any


class ExtractionResponse(
    BaseModel
):

    file_name: str

    total_pages: int

    content: List[
        Dict[str, Any]
    ]