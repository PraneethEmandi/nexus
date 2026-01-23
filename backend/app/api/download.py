from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.schemas import DownloadRequest
from app.services.file_service import create_zip_stream

router = APIRouter()

@router.post("/download_zip")
async def download_zip(request: DownloadRequest):
    zip_stream = create_zip_stream(request.file_paths)
    
    return StreamingResponse(
        zip_stream,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=nexus_photos.zip"}
    )