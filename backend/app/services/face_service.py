import shutil
import os
from deepface import DeepFace
from app.core.database import get_db_collection, UPLOAD_DIR

def search_faces_by_image(file_obj, filename: str) -> list[str]:
    # 1. Save Temp File
    temp_path = os.path.join(UPLOAD_DIR, filename)
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file_obj, buffer)

    try:
        # 2. Generate Embedding
        embedding_obj = DeepFace.represent(
            img_path=temp_path,
            model_name="ArcFace",
            enforce_detection=True
        )
        user_vector = embedding_obj[0]["embedding"]

        # 3. Query Database
        collection = get_db_collection()
        results = collection.query(
            query_embeddings=[user_vector],
            n_results=15
        )

        # 4. Filter & Format
        matches = []
        seen = set()
        
        if results['metadatas']:
            for meta in results['metadatas'][0]:
                fname = meta['filename']
                if fname not in seen:
                    # Return standard relative path
                    matches.append(f"/photos/{fname}")
                    seen.add(fname)
        
        return matches

    finally:
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)