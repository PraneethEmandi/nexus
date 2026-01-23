from fastapi import FastAPI, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware # <--- NEW IMPORT
import chromadb
from deepface import DeepFace
import shutil
import os

app = FastAPI()

# --- NEW: ALLOW BROWSER ACCESS (CORS) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (perfect for local testing)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],
)
# ----------------------------------------

# --- CONFIGURATION ---
DB_PATH = "./my_local_db_retinaFace"  # Chroma will create this folder

client = chromadb.PersistentClient(path=DB_PATH)
collection = client.get_collection(name="event_faces")

app.mount("/photos", StaticFiles(directory="photos"), name="photos")

@app.post("/search")
async def search_faces(file: UploadFile = File(...)):
    temp_path = f"uploads/{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # 1. Get Vector for Selfie
        embedding_obj = DeepFace.represent(
            img_path=temp_path,
            model_name="ArcFace",
            enforce_detection=True
        )
        user_vector = embedding_obj[0]["embedding"]

        # 2. Search ChromaDB
        results = collection.query(
            query_embeddings=[user_vector],
            n_results=5 
        )

        # 3. Format Results
        matches = []
        seen_files = set()
        
        if results['metadatas']:
            for meta in results['metadatas'][0]:
                filename = meta['filename']
                if filename not in seen_files:
                    matches.append(f"/photos/{filename}")
                    seen_files.add(filename)

        print(f"DEBUG: Found matches: {matches}")  # <--- Print to terminal to debug

        return JSONResponse(content={"matches": matches})

    except Exception as e:
        print(f"ERROR: {e}") # Print error to terminal
        return JSONResponse(content={"error": str(e)}, status_code=500)
    
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)