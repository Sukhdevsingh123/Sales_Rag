import os
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor, as_completed

import fitz
import pdfplumber
import pandas as pd
import pypdfium2 as pdfium

from io import BytesIO
from PIL import Image

from app.vlm import generate_image_caption_async


# ─────────────────────────────────────────
# EasyOCR — lazy load only when needed
# ─────────────────────────────────────────
_ocr_reader = None

def get_ocr_reader():
    global _ocr_reader
    if _ocr_reader is None:
        from easyocr import Reader
        _ocr_reader = Reader(["en"], gpu=True)
    return _ocr_reader


# ─────────────────────────────────────────
# PDF → images (for OCR fallback)
# ─────────────────────────────────────────
def pdf_to_images(pdf_path: str) -> list:
    pdf = pdfium.PdfDocument(pdf_path)
    renderer = pdf.render(
        pdfium.PdfBitmap.to_pil,
        page_indices=range(len(pdf)),
        scale=300 / 72
    )
    images = []
    for image in renderer:
        buffer = BytesIO()
        image.save(buffer, format="JPEG", optimize=True)
        images.append(buffer.getvalue())
    return images


# ─────────────────────────────────────────
# OCR fallback (used only if PDF has no text)
# ─────────────────────────────────────────
def extract_text_easyocr(pdf_path: str) -> list:
    reader = get_ocr_reader()
    images = pdf_to_images(pdf_path)
    pages = []
    for idx, image_bytes in enumerate(images):
        image = Image.open(BytesIO(image_bytes))
        result = reader.readtext(image)
        page_text = "\n".join(item[1] for item in result)
        pages.append({
            "page": idx + 1,
            "type": "text",
            "content": page_text
        })
    return pages


# ─────────────────────────────────────────
# Section title detection
# ─────────────────────────────────────────
def detect_section_title(page) -> str:
    blocks = page.get_text("dict")
    candidates = []

    for block in blocks["blocks"]:
        if "lines" not in block:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                text = span["text"].strip()
                if not text or text.isdigit():
                    continue
                if text in ["•", "-", "*"]:
                    continue
                candidates.append({
                    "text": text,
                    "size": span["size"]
                })

    if not candidates:
        return ""

    candidates.sort(key=lambda x: x["size"], reverse=True)
    return candidates[0]["text"]


# ─────────────────────────────────────────
# Layout detection
# ─────────────────────────────────────────
def detect_layout(page) -> list:
    blocks = page.get_text("blocks")
    layout = []
    for block in blocks:
        try:
            text = block[4]
            if len(text.strip()) < 5:
                continue
            layout.append({
                "bbox": [block[0], block[1], block[2], block[3]],
                "block_type": "text",
                "content": text.strip()
            })
        except Exception:
            pass
    return layout


# ─────────────────────────────────────────
# Save image to disk — returns path or None
# ─────────────────────────────────────────
def save_image(doc, xref: int, page_num: int, img_index: int, image_output_dir: str):
    try:
        pix = fitz.Pixmap(doc, xref)

        if pix.width < 150 or pix.height < 150:
            return None

        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]

        if len(image_bytes) < 10000:
            return None

        ext = base_image["ext"]
        image_name = f"page_{page_num + 1}_{img_index}.{ext}"
        image_path = os.path.join(image_output_dir, image_name)

        with open(image_path, "wb") as f:
            f.write(image_bytes)

        return image_path

    except Exception as e:
        print(f"Save Image Error: {e}")
        return None


# ─────────────────────────────────────────
# Main extraction — async for parallel VLM
# ─────────────────────────────────────────
async def extract_pdf_content_async(
    pdf_path: str,
    image_output_dir: str,
    skip_images: bool = False
) -> list:

    doc = fitz.open(pdf_path)
    os.makedirs(image_output_dir, exist_ok=True)

    content = []
    image_tasks = []  # (coroutine, metadata)

    for page_num in range(len(doc)):
        page = doc[page_num]
        section = detect_section_title(page)
        text = page.get_text()
        layout = detect_layout(page)

        content.append({
            "page": page_num + 1,
            "section": section,
            "type": "text",
            "layout": layout,
            "content": text
        })

        if skip_images:
            continue

        for img_index, img in enumerate(page.get_images(full=True)):
            xref = img[0]
            image_path = save_image(doc, xref, page_num, img_index, image_output_dir)

            if image_path:
                image_tasks.append({
                    "page": page_num + 1,
                    "section": section,
                    "path": image_path
                })

    doc.close()

    # ── Parallel async VLM calls ──
    if image_tasks:
        print(f"Processing {len(image_tasks)} images in parallel...")

        async def caption_with_meta(task):
            caption = await generate_image_caption_async(task["path"])
            return {
                "page": task["page"],
                "section": task["section"],
                "type": "image",
                "path": task["path"],
                **caption
            }

        # Run all VLM calls concurrently (max 3 at a time to not overload GPU)
        semaphore = asyncio.Semaphore(3)

        async def bounded_caption(task):
            async with semaphore:
                return await caption_with_meta(task)

        results = await asyncio.gather(*[bounded_caption(t) for t in image_tasks])
        content.extend(results)

    return content




async def extract_pdf_content(
    pdf_path: str,
    image_output_dir: str,
    skip_images: bool = False
) -> list:

    return await extract_pdf_content_async(
        pdf_path,
        image_output_dir,
        skip_images
    )







# ─────────────────────────────────────────
# Table → RAG Friendly Text
# ─────────────────────────────────────────
def table_to_text(table) -> str:

    if not table:
        return ""

    lines = []

    # 2-column key-value tables
    if len(table[0]) == 2:

        for row in table:

            if not row:
                continue

            key = str(row[0]).strip() if row[0] else ""
            value = str(row[1]).strip() if row[1] else ""

            if key or value:
                lines.append(
                    f"{key}: {value}"
                )

        return "\n".join(lines)

    # Multi-column tables
    headers = []

    for col in table[0]:
        headers.append(
            str(col).strip() if col else ""
        )

    for row in table[1:]:

        row_parts = []

        for header, value in zip(headers, row):

            value = (
                str(value).strip()
                if value else ""
            )

            if value:

                if header:
                    row_parts.append(
                        f"{header}: {value}"
                    )
                else:
                    row_parts.append(
                        value
                    )

        if row_parts:

            lines.append(
                " | ".join(row_parts)
            )

    return "\n".join(lines)




# ─────────────────────────────────────────
# Table extraction
# ─────────────────────────────────────────
def extract_tables(pdf_path: str) -> list:

    tables_data = []

    doc = fitz.open(pdf_path)

    with pdfplumber.open(pdf_path) as pdf:

        for page_no, page in enumerate(pdf.pages):

            tables = page.extract_tables()

            print(
                "TABLES FOUND =",
                len(tables)
            )

            for table in tables:

                try:

                    table_text = table_to_text(
                        table
                    )

                    if not table_text.strip():
                        continue

                    section = detect_section_title(
                        doc[page_no]
                    )

                    tables_data.append({

                        "page":
                            page_no + 1,

                        "section":
                            section,

                        "type":
                            "table",

                        "text":
                            table_text
                    })

                except Exception as e:

                    print(
                        "TABLE ERROR:",
                        e
                    )

    doc.close()

    print(
        "TOTAL TABLES GENERATED =",
        len(tables_data)
    )

    return tables_data