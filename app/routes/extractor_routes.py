from pathlib import Path
import json
import logging

from fastapi import APIRouter, UploadFile, File, Query

from app.Extractor.extractor import (
    extract_pdf_content,
    extract_tables
)

from app.Extractor.cleaner import (
    clean_text,
    remove_repeated_lines
)

from app.Extractor.normalizer import (
    normalize_content
)

router = APIRouter()

logger = logging.getLogger(__name__)

INPUT_DIR = Path("input")
OUTPUT_DIR = Path("output")

INPUT_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

@router.get("/")
def home():
    return {
        "status": "running",
        "message": "PDF Extractor API"
    }


@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    skip_images: bool = Query(
        default=False,
        description="Skip VLM image captioning for faster processing"
    )
):
    logger.info(
        f"Received File: {file.filename} | skip_images={skip_images}"
    )

    file_path = INPUT_DIR / file.filename

    with open(file_path, "wb") as f:
        f.write(await file.read())

    image_dir = OUTPUT_DIR / f"{file_path.stem}_images"

    content = await extract_pdf_content(
        str(file_path),
        str(image_dir),
        skip_images=skip_images
    )

    tables = extract_tables(
        str(file_path)
    )

    text_pages = [
        item["content"]
        for item in content
        if item["type"] == "text"
    ]

    cleaned_pages = remove_repeated_lines(
        text_pages
    )

    cleaned_content = []
    text_idx = 0

    for item in content:

        if item["type"] == "text":

            item["content"] = clean_text(
                cleaned_pages[text_idx]
            )

            text_idx += 1

        cleaned_content.append(item)

    cleaned_content.extend(tables)

    output = {
        "file_name": file.filename,
        "total_pages": len(text_pages),
        "skip_images": skip_images,
        "content": cleaned_content
    }

    normalized_docs = normalize_content(
        output
    )

    output_file = (
        OUTPUT_DIR /
        f"{file_path.stem}.json"
    )

    normalized_file = (
        OUTPUT_DIR /
        f"{file_path.stem}_normalized.json"
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

    with open(
        normalized_file,
        "w",
        encoding="utf-8"
    ) as f:
        json.dump(
            normalized_docs,
            f,
            indent=4,
            ensure_ascii=False
        )

    logger.info(
        f"Raw Output: {output_file}"
    )

    logger.info(
        f"Normalized Output: {normalized_file}"
    )

    return {
        "file_name": file.filename,
        "total_pages": len(text_pages),
        "total_chunks": len(normalized_docs),
        "skip_images": skip_images,
        "content": cleaned_content
    }

