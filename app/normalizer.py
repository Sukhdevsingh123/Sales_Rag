
from typing import Dict, List
from collections import defaultdict


def safe_str(value):

    if value is None:
        return ""

    if isinstance(
        value,
        list
    ):
        return " ".join(
            str(x)
            for x in value
        )

    return str(
        value
    )


def normalize_content(extracted_json: Dict) -> List[Dict]:

    documents = []
    content = extracted_json.get("content", [])
    file_name = extracted_json.get("file_name", "")
    total_pages = extracted_json.get("total_pages", 0)

    # ── Group all items by page ──
    pages = defaultdict(lambda: {
        "text": "",
        "table_text": "",
        "image_text": "",
        "section": ""
    })

    for item in content:
        if not isinstance(item, dict):
            continue

        item_type = item.get("type", "")
        page = item.get("page", 0)
        section = item.get("section", "")
        if not isinstance(section, str):
            section = ""
        section = section.strip()

        if section:
            pages[page]["section"] = section

        # ── TEXT ──
        if item_type == "text":
            text = item.get("content", "").strip()
            if text:
                existing = pages[page]["text"]
                pages[page]["text"] = (existing + " " + text).strip() if existing else text

        # ── TABLE ──
        elif item_type == "table":
            table_text = item.get("text", "").strip()
            if table_text:
                existing = pages[page]["table_text"]
                pages[page]["table_text"] = (existing + "\n" + table_text).strip() if existing else table_text

        # ── IMAGE ──
        elif item_type == "image":
            image_type = safe_str(
                item.get(
                    "image_type"
                )
            ).strip()

            image_caption = safe_str(
                item.get(
                    "image_caption"
                )
            ).strip()

            diagram_summary = safe_str(
                item.get(
                    "diagram_summary"
                )
            ).strip()

            if any([image_type, image_caption, diagram_summary]):
                parts = []
                if image_caption:
                    parts.append(image_caption)
                if diagram_summary:
                    parts.append(diagram_summary)
                if image_type:
                    parts.append(f"Image type: {image_type}")

                image_str = " | ".join(parts)
                existing = pages[page]["image_text"]
                pages[page]["image_text"] = (existing + " | " + image_str).strip() if existing else image_str

    # ── Build one document per page ──
    for page_num in sorted(pages.keys()):
        page_data   = pages[page_num]
        text        = page_data["text"]
        table_text  = page_data["table_text"]
        image_text  = page_data["image_text"]
        section     = page_data["section"]

        # Build combined_text
        parts = []
        if text:
            parts.append(text)
        if table_text:
            parts.append(f"[TABLE]\n{table_text}")
        if image_text:
            parts.append(f"[IMAGE]\n{image_text}")

        combined_text = "\n\n".join(parts).strip()

        if not combined_text:
            continue

        documents.append({
            "page":          page_num,
            "section":       section,
            "file_name":     file_name,
            "total_pages":   total_pages,
            "text":          text,
            "table_text":    table_text,
            "image_text":    image_text,
            "combined_text": combined_text,
            "metadata": {
                "page":      page_num,
                "section":   section,
                "file_name": file_name,
                "has_text":  bool(text),
                "has_table": bool(table_text),
                "has_image": bool(image_text)
            }
        })

    return documents