# 📸 AI Photo Finder – Local-First Face Search

An AI-powered application that helps users find their photos from large event albums using a single selfie.

The system runs completely **locally**, indexes event photos on your machine, and **deletes uploaded selfies immediately** after processing — ensuring maximum privacy.

---

## 🧠 Core Tech Stack

### Backend
- Python
- FastAPI
- DeepFace (Face Recognition)
- ChromaDB (Vector Search)

### Frontend
- Next.js
- TypeScript
- Tailwind CSS

### Privacy Principles
- ✅ Local-first processing  
- 🗑️ Selfies are deleted immediately after matching  
- 🔒 No cloud storage or third-party APIs  

---

## 🛠️ Prerequisites

Before starting, ensure you have:

- **Python 3.10+**
  ```bash
  python --version
  ```

- **Node.js 18+**
  ```bash
  node -v
  ```

---

## 📂 Project Structure

```text
root/
│
├── backend/
│   ├── photos/           # Event photos go here
│   ├── indexer.py        # Builds face embeddings database
│   ├── main.py           # FastAPI server
│   ├── requirements.txt  # Python dependencies
│
├── frontend/
│   ├── app/              # Next.js app
│   ├── package.json
│
└── README.md
```

---

## 🚀 Instructions (Step-by-Step)

### ⚙️ Step 1: Backend Setup (The Brain)

#### 1️⃣ Open a terminal and navigate to backend
```bash
cd backend
```

#### 2️⃣ Install Python dependencies
```bash
pip install -r requirements.txt
```

> ⏳ First-time installation may take a few minutes (TensorFlow will be downloaded).

---

#### 3️⃣ Add event photos

- Copy all event photos (`.jpg`, `.jpeg`, `.png`)
- Paste them into:
  ```text
  backend/photos/
  ```

💡 **Tip:** Clear, well-lit faces give the best results.

---

#### 4️⃣ Build the photo index (IMPORTANT)

You **must run this every time you add or change photos**.

```bash
python indexer.py
```

Wait until you see:
```text
🎉 Done! Database saved...
```

---

#### 5️⃣ Start the backend server
```bash
uvicorn main:app --reload
```

Backend will be available at:
```
http://127.0.0.1:8000
```

⚠️ **Keep this terminal running**

---

### 🎨 Step 2: Frontend Setup (The Interface)

#### 1️⃣ Open a NEW terminal

#### 2️⃣ Navigate to frontend
```bash
cd frontend
```

#### 3️⃣ Install frontend dependencies
```bash
npm install
```

#### 4️⃣ Start the development server
```bash
npm run dev
```

Frontend will be live at:
```
http://localhost:3000
```

---

## 🎮 Usage Instructions

### 📷 Finding Your Photos

1️⃣ **Ensure photos are indexed**
- Photos must exist in `backend/photos/`
- Run:
  ```bash
  python indexer.py
  ```

2️⃣ **Open the app**
- Visit:
  ```
  http://localhost:3000
  ```

3️⃣ **Upload a selfie**
- Click **Choose File**
- Upload a clear selfie of yourself

5️⃣ **View & download results**
- Matching photos will appear automatically
- Click **Download** to save any image

---

## 🔁 When to Re-Index Photos

Run the indexer again if:
- You add new event photos
- You remove photos
- You replace photos

```bash
python indexer.py
```

---

## 🛡️ Privacy & Security

- Selfies are processed **in-memory only**
- Uploaded selfies are deleted immediately
- All face embeddings are stored locally
- No internet connection required after setup

---

## 🧪 Best Practices

- Use front-facing selfies
- Avoid sunglasses, masks, or heavy filters
- Ensure consistent lighting
- Do not resize or compress event photos before indexing

---

✨ Built for privacy-first event photo discovery.
