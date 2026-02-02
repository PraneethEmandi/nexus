
import shutil
import os
import numpy as np
import cv2
from typing import BinaryIO
from deepface import DeepFace #type: ignore
from app.core.database import get_db_collection, UPLOAD_DIR
from app.core.face_models import MODELS, BACKENDS


# Helper: L2 Normalization
def l2_normalize(x: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(x)
    if norm == 0:
        return x
    return x / norm

# Image Quality Gate: Blur & Brightness
def crop_to_oval(img: np.ndarray) -> np.ndarray:
    h, w = img.shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)
    center = (w // 2, h // 2)
    axes = (w // 4, h // 3)
    cv2.ellipse(mask, center, axes, 0, 0, 360, 255, -1)
    result = cv2.bitwise_and(img, img, mask=mask)
    # Crop to bounding box of oval
    x1 = center[0] - axes[0]
    y1 = center[1] - axes[1]
    x2 = center[0] + axes[0]
    y2 = center[1] + axes[1]
    return result[y1:y2, x1:x2]

def validate_image_quality(image_path: str):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Invalid image file.")
    oval_img = crop_to_oval(img)
    gray = cv2.cvtColor(oval_img, cv2.COLOR_BGR2GRAY)
    # Brightness check
    avg_intensity = np.mean(gray)
    if avg_intensity < 40:
        raise ValueError("Image too dark. Please retake in better lighting.")
    if avg_intensity > 240:
        raise ValueError("Image too bright. Please retake in normal lighting.")
    # Blur check
    blur_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    if blur_var < 50:
        raise ValueError("Image too blurry. Please hold camera steady.")
    return True

def search_faces_by_single_image(file_obj: BinaryIO, filename: str) -> list:
    temp_path = os.path.join(UPLOAD_DIR, f"single_{filename}")
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file_obj, buffer)

        # Image Quality Gate (only inside oval)
        validate_image_quality(temp_path)

        # DeepFace Embedding (on oval region)
        img = cv2.imread(temp_path)
        oval_img = crop_to_oval(img)
        oval_temp_path = temp_path.replace('.jpg', '_oval.jpg')
        cv2.imwrite(oval_temp_path, oval_img)

        embedding_obj = DeepFace.represent(
            img_path=oval_temp_path,
            model_name=MODELS[6],  # ArcFace
            detector_backend=BACKENDS[5],  # RetinaFace
            enforce_detection=True,
            align=True
        )
        # Face angle validation
        face_info = embedding_obj[0]
        if "facial_area" in face_info and "pose" in face_info:
            pose = face_info["pose"]
            yaw = abs(pose.get("yaw", 0))
            pitch = abs(pose.get("pitch", 0))
            roll = abs(pose.get("roll", 0))
            if yaw > 20 or pitch > 20 or roll > 20:
                raise ValueError("Please face the camera directly.")

        vector = face_info["embedding"]
        final_vector = l2_normalize(np.array(vector))
        print(f"[DEBUG] Query embedding: {final_vector[:10]}... (len={len(final_vector)})")

        # Query Database
        collection = get_db_collection()
        results = collection.query(
            query_embeddings=[final_vector.tolist()],
            n_results=100
        )
        print(f"[DEBUG] Raw DB query results: {results}")

        matches = []
        seen = set()
        DISTANCE_THRESHOLD = 0.75
        metadatas_batch = results.get("metadatas")
        distances_batch = results.get("distances")

        if metadatas_batch and len(metadatas_batch) > 0 and distances_batch:
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
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        oval_temp_path = temp_path.replace('.jpg', '_oval.jpg')
        if os.path.exists(oval_temp_path):
            os.remove(oval_temp_path)