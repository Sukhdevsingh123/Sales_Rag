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
        "prompt": """You are analyzing a visual element extracted from a PDF.

Return JSON only.

{
  "image_type": "",
  "title": "",
  "image_caption": "",
  "diagram_summary": "",
  "key_points": []
}

Rules:

1. Classify image_type as one of:
   - decorative_image
   - product_photo
   - infographic
   - chart
   - graph
   - diagram
   - workflow
   - architecture
   - screenshot
   - table
   - technical_figure

2. Ignore normal document paragraphs.

3. Do NOT OCR page text unless it belongs to:
   - infographic
   - chart
   - diagram
   - table

4. For decorative or marketing images:
   - Keep image_caption short.
   - Explain only the visual purpose.

5. For tables:
   - Summarize the table contents.
   - Mention important entities and comparisons.

6. For diagrams, workflows, charts:
   - Explain relationships, flow, trends, or architecture.

7. image_caption should describe WHAT is visible.

8. diagram_summary should explain WHY the visual matters.

9. key_points should contain 3-10 concise bullets.

10. Return valid JSON only.

11. Do not wrap JSON in markdown code blocks.""",
        "images": [image_base64],
        "stream": False,
        "format": "json"
    }

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                OLLAMA_URL,
                json=payload
            )

            response.raise_for_status()

            raw = response.json()["response"].strip()

            # strip markdown if model wraps in code blocks
            if raw.startswith("```"):
                parts = raw.split("```")

                if len(parts) > 1:
                    raw = parts[1]

                    if raw.startswith("json"):
                        raw = raw[4:]

                    raw = raw.strip()

            result = json.loads(raw)

            defaults = {
                "image_type": "",
                "title": "",
                "image_caption": "",
                "diagram_summary": "",
                "key_points": []
            }

            for key, value in defaults.items():
                if key not in result:
                    result[key] = value

            if not isinstance(result["key_points"], list):
                result["key_points"] = []

            return result

    except Exception as e:
        print(f"VLM Error for {image_path}: {e}")

        return {
            "image_type": "",
            "title": "",
            "image_caption": "",
            "diagram_summary": "",
            "key_points": []
        }
   

    

def generate_image_caption(image_path: str) -> dict:
    """Sync wrapper for async caption generation."""
    return asyncio.run(generate_image_caption_async(image_path))