from pathlib import Path
import json
import logging

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from app.extractor import (
    extract_text_pypdf,
    extract_text_easyocr
)

from app.cleaner import clean_text

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

INPUT_DIR = Path("input")
OUTPUT_DIR = Path("output")

INPUT_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)


@app.get("/")
def home():
    return {
        "status": "running",
        "message": "PDF Extractor API"
    }


@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...)
):

    logger.info(f"Received File: {file.filename}")

    file_path = INPUT_DIR / file.filename

    with open(file_path, "wb") as f:
        f.write(await file.read())

    logger.info("File Saved Successfully")

    text = extract_text_pypdf(file_path)

    extraction_method = "pypdf"

    if len(text.strip()) < 100:

        logger.info(
            "Digital extraction failed. Starting OCR..."
        )

        text = extract_text_easyocr(file_path)

        extraction_method = "easyocr"

    cleaned_text = clean_text(text)

    output = {
        "file_name": file.filename,
        "extraction_method": extraction_method,
        "text": cleaned_text
    }

    output_file = (
        OUTPUT_DIR /
        f"{file_path.stem}.json"
    )

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            output,
            f,
            indent=4,
            ensure_ascii=False
        )

    logger.info(
        f"Output Saved: {output_file}"
    )

    return output