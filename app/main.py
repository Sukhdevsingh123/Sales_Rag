import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.extractor_routes import router as extractor_router

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="PDF Extractor API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    extractor_router
)
