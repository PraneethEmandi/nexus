from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import List
from app.services.face_service import search_faces_by_multiple_images
from app.models.schemas import SearchResponse

router = APIRouter()

# ⚠️ KEY CHANGE: We ONLY accept 'files' (plural). 
# This matches the frontend's formData.append("files", ...)
@router.post("/search", response_model=SearchResponse)
async def search_photos(files: List[UploadFile] = File(...)):
    
    # 1. Debugging: Print what we received
    print(f"--- Incoming Request ---")
    print(f"Received {len(files)} files.")

    # 2. Validation
    if not files:
        raise HTTPException(status_code=400, detail="No images uploaded.")

    try:
        # 3. Extract data for the service
        # Convert UploadFile objects to what the service needs
        file_objects = [f.file for f in files]
        filenames = [f.filename for f in files]

        # 4. Call the Multi-Frame Service
        matches = search_faces_by_multiple_images(file_objects, filenames)
        
        return SearchResponse(matches=matches)

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")