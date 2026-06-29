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