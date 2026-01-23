from pydantic import BaseModel
from typing import List

# Request Model for Download
class DownloadRequest(BaseModel):
    file_paths: List[str]

# Response Model for Search
class SearchResponse(BaseModel):
    matches: List[str]