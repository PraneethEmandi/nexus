
import shutil
import os
import numpy as np
from typing import List, BinaryIO # <--- Import explicit types
from deepface import DeepFace #type: ignore
from app.core.database import get_db_collection, UPLOAD_DIR
from app.core.face_models import MODELS, BACKENDS, METRICS

# Helper: L2 Normalization
def l2_normalize(x: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(x)
    if norm == 0:
        return x
    return x / norm

# CHANGED: Added specific type hints for file_objs and filenames
def search_faces_by_multiple_images(file_objs: List[BinaryIO], filenames: List[str]) -> List[dict]:
    valid_embeddings = []

    # 1. Process each frame
    for i, file_obj in enumerate(file_objs):
        temp_filename = f"frame_{i}_{filenames[i]}"
        temp_path = os.path.join(UPLOAD_DIR, temp_filename)
        try:
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file_obj, buffer)

            embedding_obj = DeepFace.represent(
                img_path=temp_path,
                model_name=MODELS[6],  # Using ArcFace
                detector_backend=BACKENDS[5],  # Using RetinaFace
                enforce_detection=True,
                align=True
            )
            vector = embedding_obj[0]["embedding"]
            print(f"[DEBUG] Frame {i} embedding: {vector[:10]}... (len={len(vector)})")
            valid_embeddings.append(vector)
        except Exception as e:
            print(f"Skipping frame {i}: {e}")
            continue
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    # 2. Quality Gate
    if not valid_embeddings:
        raise ValueError("No valid faces detected in any frame.")

    # 3. Super-Embedding Calculation
    embeddings_matrix = np.array(valid_embeddings)
    mean_vector = np.mean(embeddings_matrix, axis=0)
    final_vector = l2_normalize(mean_vector)
    print(f"[DEBUG] Final query embedding: {final_vector[:10]}... (len={len(final_vector)})")

    # 4. Query Database
    collection = get_db_collection()
    
    # Remove upper cap: set n_results to a high value or let DB return all (if supported)
    results = collection.query(
        query_embeddings=[final_vector.tolist()],
        n_results=100  # Set to a high value; adjust as needed for your DB
    )
    print(f"[DEBUG] Raw DB query results: {results}")

    matches: List[dict] = []
    seen = set()
    DISTANCE_THRESHOLD = 0.75  # <-- Experiment with this value

    metadatas_batch = results.get("metadatas")
    distances_batch = results.get("distances")

    if metadatas_batch is not None and len(metadatas_batch) > 0 and distances_batch is not None:
        first_result_metadatas = metadatas_batch[0]
        first_result_distances = distances_batch[0]

        for meta, dist in zip(first_result_metadatas, first_result_distances):
            print(f"[DEBUG] Result meta: {meta}, distance: {dist}")
            if isinstance(meta, dict):
                fname = str(meta.get("filename", ""))
                if fname and fname not in seen and dist <= DISTANCE_THRESHOLD:
                    matches.append({"url": f"/photos/{fname}", "distance": dist})
                    seen.add(fname)
    return matches