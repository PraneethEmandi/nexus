import chromadb
import os

# Configuration
DB_PATH = "./my_local_db"
PHOTO_DIR = "photos"
UPLOAD_DIR = "uploads"

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize Database Client
def get_db_collection():
    client = chromadb.PersistentClient(path=DB_PATH)
    return client.get_collection(name="event_faces")