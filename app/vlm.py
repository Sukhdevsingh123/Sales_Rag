import base64
import json
import asyncio
import httpx

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "qwen2.5vl:7b"


def image_to_base64(image_path: str) -> str:
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode()


async def generate_image_caption_async(image_path: str) -> dict:
    image_base64 = image_to_base64(image_path)

    payload = {
        "model": MODEL_NAME,
        "prompt": (
            "Analyze this image extracted from a PDF document. "
            "Return ONLY a valid JSON object with these exact keys. "
            "No explanation, no markdown, no code blocks, just raw JSON.\n\n"
            "{\n"
            '  "image_type": "one of: photo, chart, table, infographic, flowchart, diagram, text_image, logo",\n'
            '  "visible_text": "all text visible in the image, comma separated",\n'
            '  "image_caption": "one clear sentence describing what this image shows",\n'
            '  "diagram_summary": "2-3 sentences explaining the content and meaning of this image"\n'
            "}"
        ),
        "images": [image_base64],
        "stream": False,
        "format": "json"
    }

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(OLLAMA_URL, json=payload)
            response.raise_for_status()
            raw = response.json()["response"].strip()

            # strip markdown if model wraps in code blocks
            if raw.startswith("```"):
                parts = raw.split("```")
                raw = parts[1]
                if raw.startswith("json"):
                    raw = raw[4:]
                raw = raw.strip()

            result = json.loads(raw)

            # validate keys exist
            for key in ["image_type", "visible_text", "image_caption", "diagram_summary"]:
                if key not in result:
                    result[key] = ""

            return result

    except Exception as e:
        print(f"VLM Error for {image_path}: {e}")
        return {
            "image_type": "",
            "visible_text": "",
            "image_caption": "",
            "diagram_summary": ""
        }


def generate_image_caption(image_path: str) -> dict:
    """Sync wrapper for async caption generation."""
    return asyncio.run(generate_image_caption_async(image_path))