import re
from typing import Dict, List


# ─────────────────────────────────────────
# Split long text into chunks for RAG
# ─────────────────────────────────────────
def chunk_text(text: str, max_words: int = 200, overlap_words: int = 30) -> List[str]:
    """
    Split text into overlapping chunks by word count.
    overlap_words: how many words from end of prev chunk
                   repeat at start of next chunk (context continuity)
    """
    words = text.split()

    if len(words) <= max_words:
        return [text]

    chunks = []
    start = 0

    while start < len(words):
        end = start + max_words
        chunk = " ".join(words[start:end])
        chunks.append(chunk)

        if end >= len(words):
            break

        start = end - overlap_words  # overlap for context

    return chunks


# ─────────────────────────────────────────
# Main normalizer — outputs RAG-ready docs
# ─────────────────────────────────────────
def normalize_content(extracted_json: Dict) -> List[Dict]:

    documents = []
    content = extracted_json.get("content", [])
    file_name = extracted_json.get("file_name", "")
    total_pages = extracted_json.get("total_pages", 0)

    for item in content:
        item_type = item.get("type", "")
        page = item.get("page", 0)
        section = item.get("section", "").strip()

        # ── TEXT ──────────────────────────────
        if item_type == "text":
            text = item.get("content", "").strip()

            if not text:
                continue

            # chunk long text for better RAG retrieval
            chunks = chunk_text(text, max_words=200, overlap_words=30)

            for chunk_idx, chunk in enumerate(chunks):
                if not chunk.strip():
                    continue

                documents.append({
                    "chunk_id": f"{file_name}_p{page}_text_c{chunk_idx}",
                    "page": page,
                    "section": section,
                    "source_type": "text",
                    "total_pages": total_pages,
                    "file_name": file_name,
                    "text": chunk.strip(),
                    "metadata": {
                        "page": page,
                        "section": section,
                        "source_type": "text",
                        "chunk_index": chunk_idx,
                        "total_chunks": len(chunks)
                    }
                })

        # ── TABLE ─────────────────────────────
        elif item_type == "table":
            table_text = item.get("text", "").strip()

            if not table_text:
                continue

            documents.append({
                "chunk_id": f"{file_name}_p{page}_table",
                "page": page,
                "section": section,
                "source_type": "table",
                "total_pages": total_pages,
                "file_name": file_name,
                "text": table_text,
                "metadata": {
                    "page": page,
                    "section": section,
                    "source_type": "table",
                    "chunk_index": 0,
                    "total_chunks": 1
                }
            })

        # ── IMAGE ─────────────────────────────
        elif item_type == "image":
            image_type = item.get("image_type", "").strip()
            visible_text = item.get("visible_text", "").strip()
            image_caption = item.get("image_caption", "").strip()
            diagram_summary = item.get("diagram_summary", "").strip()

            # skip empty images
            if not any([image_type, visible_text, image_caption, diagram_summary]):
                continue

            # build searchable text for embedding
            parts = []
            if section:
                parts.append(f"Section: {section}")
            if image_type:
                parts.append(f"Image Type: {image_type}")
            if visible_text:
                parts.append(f"Visible Text: {visible_text}")
            if image_caption:
                parts.append(f"Caption: {image_caption}")
            if diagram_summary:
                parts.append(f"Summary: {diagram_summary}")

            combined_text = "\n".join(parts)

            documents.append({
                "chunk_id": f"{file_name}_p{page}_image",
                "page": page,
                "section": section,
                "source_type": "image",
                "total_pages": total_pages,
                "file_name": file_name,
                "text": combined_text,
                "image_path": item.get("path", ""),
                "metadata": {
                    "page": page,
                    "section": section,
                    "source_type": "image",
                    "image_type": image_type,
                    "chunk_index": 0,
                    "total_chunks": 1
                }
            })

    return documents