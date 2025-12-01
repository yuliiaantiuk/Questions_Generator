from pydantic import BaseModel
from typing import List
# Schema for text extraction request
class TextRequest(BaseModel):
    text: str
    top_n: int = 7