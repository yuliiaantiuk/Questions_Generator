from pydantic import BaseModel
from typing import List

class TextRequest(BaseModel):
    text: str
    top_n: int = 10