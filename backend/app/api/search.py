from fastapi import APIRouter, File, UploadFile, HTTPException
from app.services.face_service import search_faces_by_image
from app.models.schemas import SearchResponse

router = APIRouter()

@router.post("/search", response_model=SearchResponse)
async def search_photos(file: UploadFile = File(...)):
    try:
        matches = search_faces_by_image(file.file, file.filename)
        return SearchResponse(matches=matches)
    except Exception as e:
        # In production, log this error
        raise HTTPException(status_code=500, detail=str(e))