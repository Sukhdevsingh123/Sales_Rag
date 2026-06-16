import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.extractor_routes import router as extractor_router
from app.routes.rag_routes import router as rag_router
from app.routes.auth_routes import router as auth_router
from app.core.database import engine
from app.core.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="PDF RAG API with Authentication"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth_router
)
app.include_router(
    extractor_router
)
app.include_router(
    rag_router
)