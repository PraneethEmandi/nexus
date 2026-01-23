import os
import chromadb
from deepface import DeepFace #type: ignore

# --- CONFIGURATION ---
PHOTO_FOLDER = "./photos"
DB_PATH = "./my_local_db_arcFacw"  # Chroma will create this folder

# 1. Initialize ChromaDB (Persistent means it saves to disk)
client = chromadb.PersistentClient(path=DB_PATH)
collection = client.get_or_create_collection(name="event_faces")

models = [
    "VGG-Face", "Facenet", "Facenet512", "OpenFace", "DeepFace",
    "DeepID", "ArcFace", "Dlib", "SFace", "GhostFaceNet",
    "Buffalo_L",
]

backends = [
    'opencv', 'ssd', 'dlib', 'mtcnn', 'fastmtcnn',
    'retinaface', 'mediapipe', 'yolov8n', 'yolov8m', 
    'yolov8l', 'yolov11n', 'yolov11s', 'yolov11m',
    'yolov11l', 'yolov12n', 'yolov12s', 'yolov12m',
    'yolov12l', 'yunet', 'centerface',
]

def index_photos():
    print("🚀 Starting Local Indexing with ChromaDB...")
    files = [f for f in os.listdir(PHOTO_FOLDER) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    for file_name in files:
        img_path = os.path.join(PHOTO_FOLDER, file_name)
        print(f"Processing: {file_name}...")
        
        try:
            # Detect Faces
            faces = DeepFace.represent(
                img_path=img_path, 
                model_name=models[6],  # Using ArcFace
                detector_backend=backends[5],  # Using RetinaFace
                enforce_detection=False

            )
            
            # Prepare data for Chroma
            ids = []
            embeddings = []
            metadatas = []
            
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