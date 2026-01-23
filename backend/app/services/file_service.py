import zipfile
import io
import os
from app.core.database import PHOTO_DIR

def create_zip_stream(file_paths: list[str]) -> io.BytesIO:
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for path in file_paths:
            # Clean filename: "/photos/abc.jpg" -> "abc.jpg"
            filename = path.split("/")[-1]
            local_path = os.path.join(PHOTO_DIR, filename)
            
            if os.path.exists(local_path):
                zip_file.write(local_path, arcname=filename)
            else:
                print(f"Warning: File missing {local_path}")
    
    zip_buffer.seek(0)
    return zip_buffer