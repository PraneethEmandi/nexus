from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
# UPDATED IMPORTS: No longer 'app.api.v1'
from app.api import search, download 

app = FastAPI(title="Nexus Event Gallery API")

# 1. Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Static Files
app.mount("/photos", StaticFiles(directory="photos"), name="photos")

# 3. Register Routers
app.include_router(search.router, tags=["Search"])
app.include_router(download.router, tags=["Download"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)