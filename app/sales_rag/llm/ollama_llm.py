import os
import json
import requests

OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://localhost:11434/api/generate"
)

LLM_MODEL = os.getenv(
    "LLM_MODEL",
    "qwen3:8b"
)


def generate_answer(
    question,
    context
):

    prompt = f"""
You are a PDF RAG assistant.

Answer ONLY from the provided context.

Rules:

1. Use only the context.
2. Do not hallucinate.
3. If answer is not present say:
   "The information is not available in the document."
4. Provide detailed answers.
5. Cite page references if available.

Context:

{context}

Question:

{question}

Answer:
"""

    # payload = {
    #     "model": LLM_MODEL,
    #     "prompt": prompt,
    #     "stream": False
    # }

    if not OLLAMA_URL:
        raise ValueError(
            "OLLAMA_URL is not configured. Set the OLLAMA_URL environment variable."
        )

    if not LLM_MODEL:
        raise ValueError(
            "LLM_MODEL is not configured. Set the LLM_MODEL environment variable."
        )

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": LLM_MODEL,
            "prompt": prompt,
            "stream": True
        },
        stream=True
    )

    for line in response.iter_lines():

        if not line:
            continue

        data = json.loads(
            line.decode("utf-8")
        )

        if "response" in data:
            yield data["response"]