import chromadb
import os

# Configuration
DB_PATH = "app/my_local_db_retinaFace"
PHOTO_DIR = "photos"
UPLOAD_DIR = "uploads"

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PHOTO_DIR, exist_ok=True)
# Initialize Database Client
def get_db_collection():
    # 1. Connect to the existing DB on disk
    client = chromadb.PersistentClient(path=DB_PATH)
    
    return client.get_collection(name="event_faces")