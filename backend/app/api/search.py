
from fastapi import APIRouter, File, UploadFile, HTTPException
from app.services.face_service import search_faces_by_single_image
from app.models.schemas import SearchResponse

router = APIRouter()

# Accept a single file for search
@router.post("/search", response_model=SearchResponse)
async def search_photos(file: UploadFile = File(...)):
    print("--- Incoming Request ---")
    print(f"Received file: {file.filename}")
    if not file:
        raise HTTPException(status_code=400, detail="No image uploaded.")
    try:
        matches = search_faces_by_single_image(file.file, file.filename)
        return SearchResponse(matches=matches)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")