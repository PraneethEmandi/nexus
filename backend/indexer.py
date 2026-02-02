import os

import chromadb
from deepface import DeepFace #type: ignore
from app.core.database import PHOTO_DIR, DB_PATH
from app.core.face_models import MODELS, BACKENDS
import cv2
# import numpy as np

# Option to save images with detected faces
SAVE_DETECTED_FACES = False  # Set to False to disable saving

# --- CONFIGURATION ---
# PHOTO_DIR = "./photos"
# DB_PATH = "app/my_local_db_retinaFace"  

# 1. Initialize ChromaDB (Persistent means it saves to disk)
client = chromadb.PersistentClient(path=DB_PATH)
collection = client.create_collection(
    name="event_faces", 
    metadata={"hnsw:space": "cosine"} # <--- FORCES COSINE METRIC
)

def index_photos():
    print("🚀 Starting Local Indexing with ChromaDB...")
    files = [f for f in os.listdir(PHOTO_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    

    for file_name in files:
        img_path = os.path.join(PHOTO_DIR, file_name)
        print(f"Processing: {file_name}...")

        try:
            # Detect Faces
            faces = DeepFace.represent(
                img_path=img_path,
                model_name=MODELS[6],  # Using ArcFace
                detector_backend=BACKENDS[5],  # Using RetinaFace
                enforce_detection=False,
                align=True
            )


            # Prepare data for Chroma
            ids = []
            embeddings = []
            metadatas = []

            # Optionally save detected faces
            if SAVE_DETECTED_FACES and faces:
                # Load original image
                img = cv2.imread(img_path)
                for i, face in enumerate(faces):
                    # DeepFace returns 'facial_area' with coordinates
                    area = face.get('facial_area')
                    if area and img is not None:
                        x, y, w, h = area.get('x'), area.get('y'), area.get('w'), area.get('h')
                        face_img = img[y:y+h, x:x+w]
                        save_dir = os.path.join(PHOTO_DIR, 'detected_faces')
                        os.makedirs(save_dir, exist_ok=True)
                        save_path = os.path.join(save_dir, f"{os.path.splitext(file_name)[0]}_face_{i}.jpg")
                        cv2.imwrite(save_path, face_img)

            for i, face in enumerate(faces):
                # Chroma requires a unique ID for every face
                ids.append(f"{file_name}_face_{i}")
                embeddings.append(face["embedding"])
                metadatas.append({"filename": file_name})

            # Add to Database
            if ids:
                collection.add(
                    ids=ids,
                    embeddings=embeddings,
                    metadatas=metadatas
                )
                print(f"   ✅ Indexed {len(ids)} faces.")

        except Exception as e:
            print(f"   ❌ Error: {e}")

    print("\n🎉 Done! Database saved to folder: " + DB_PATH)

if __name__ == "__main__":
    index_photos()