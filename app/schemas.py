from pydantic import BaseModel


class ExtractionResponse(BaseModel):

    file_name: str

    extraction_method: str

    text: str