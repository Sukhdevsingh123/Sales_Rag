# import os
# import json
# import requests

# OLLAMA_URL = os.getenv(
#     "OLLAMA_URL",
#     "http://localhost:11434/api/generate"
# )

# LLM_MODEL = os.getenv(
#     "LLM_MODEL",
#     "qwen3:8b"
# )


# def generate_answer(
#     question,
#     context
# ):

#     prompt = f"""
# You are a PDF RAG assistant.

# Answer ONLY from the provided context.

# Rules:

# 1. Use only the context.
# 2. Do not hallucinate.
# 3. If answer is not present say:
#    "The information is not available in the document."
# 4. Provide detailed answers.
# 5. Cite page references if available.

# Context:

# {context}

# Question:

# {question}

# Answer:
# """

#     # payload = {
#     #     "model": LLM_MODEL,
#     #     "prompt": prompt,
#     #     "stream": False
#     # }

#     if not OLLAMA_URL:
#         raise ValueError(
#             "OLLAMA_URL is not configured. Set the OLLAMA_URL environment variable."
#         )

#     if not LLM_MODEL:
#         raise ValueError(
#             "LLM_MODEL is not configured. Set the LLM_MODEL environment variable."
#         )

#     response = requests.post(
#         OLLAMA_URL,
#         json={
#             "model": LLM_MODEL,
#             "prompt": prompt,
#             "stream": True
#         },
#         stream=True
#     )

#     for line in response.iter_lines():

#         if not line:
#             continue

#         data = json.loads(
#             line.decode("utf-8")
#         )

#         if "response" in data:
#             yield data["response"]







import os

from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate




MODEL_NAME = os.getenv(
    "LLM_MODEL",
    "qwen3:8b"
)

OLLAMA_URL = os.getenv(
    "OLLAMA_BASE_URL",
    "http://localhost:11434"
)


llm = ChatOllama(
    model=MODEL_NAME,
    base_url=OLLAMA_URL,
    temperature=0.5,
    
    
)


prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are an expert PDF RAG assistant.

Answer ONLY using the provided context.

Rules:

1. Never use outside knowledge.
2. Never hallucinate.
3. If the answer is not found say:

"The information is not available in the document."

4. Provide detailed answers.
5. Cite page references if available.
"""
        ),
        (
            "human",
            """
Context:

{context}

Question:

{question}
"""
        ),
    ]
)


chain = prompt | llm


def generate_answer(question, context):

    for chunk in chain.stream(
        {
            "context": context,
            "question": question,
        }
    ):
        if chunk.content:
            yield chunk.content