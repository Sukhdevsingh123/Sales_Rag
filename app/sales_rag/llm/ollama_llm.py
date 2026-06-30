import os
import re
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder




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
    temperature=0,
    
    
)


# prompt = ChatPromptTemplate.from_messages(
#     [
#         (
#             "system",
#             """
# You are an expert PDF RAG assistant.

# Answer ONLY using the provided context.

# Rules:

# 1. Never use outside knowledge.
# 2. Never hallucinate.
# 3. If the answer is not found say:

# "The information is not available in the document."

# 4. Provide detailed answers.
# 5. Cite page references if available.
# """
#         ),
#         MessagesPlaceholder(variable_name="messages"),
#         (
#             "human",
#             """
# Context:

# {context}

# Question:

# {question}
# """
#         ),
#     ]
# )





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
3. If information is unavailable, say:
"The information is not available in the document."
4. Use conversation summary if it helps understand follow-up questions.
5. Prefer retrieved context over memory.
"""
),

(
"system",
"""
Conversation Summary:

{summary}
"""
),

MessagesPlaceholder("messages"),

(
"human",
"""
Context:

{context}

Question:

{question}
"""
)
]
)




rewrite_prompt = ChatPromptTemplate.from_messages(
[
(
"system",
"""
You are a query rewriting assistant.

Your job is ONLY to rewrite the user's latest question into a standalone question.

Rules:

- Never answer the question.
- Use previous conversation when required.
- Resolve references like:
  - it
  - this
  - that
  - they
  - these
  - those

If the question is already standalone,
return it exactly as it is.

IMPORTANT:

Return ONLY the rewritten question.

Plain text only.

Do NOT use:

- XML
- HTML
- Markdown
- Quotes
- Bullet points
- Prefixes
- Suffixes
- Explanations

Example:

User:
What is AFF A90?

Output:
What is AFF A90?

User:
How much storage does it support?

Output:
How much storage does the AFF A90 support?
"""
),

MessagesPlaceholder("messages"),

(
"human",
"{question}"
)
]
)



rewrite_chain = rewrite_prompt | llm




summary_prompt = ChatPromptTemplate.from_messages(
[
(
"system",
"""
You are a conversation summarizer.

Your job is to summarize the conversation.

Rules:

- Preserve important facts.
- Preserve entities.
- Preserve decisions.
- Preserve user preferences.
- Preserve technical details.

Return only the summary.
"""
),

(
"human",
"""
Current Summary:

{summary}

Conversation:

{messages}

Create an updated summary.
"""
)
]
)

summary_chain = summary_prompt | llm






chain = prompt | llm





def generate_answer(question, context, summary,messages):

    for chunk in chain.stream(
        {
            "context": context,
            "question": question,
            "summary": summary,
            "messages": messages,
        }
    ):
       
    
        if chunk.content:
            yield chunk.content
            
            


def rewrite_question(question, messages):

    result = rewrite_chain.invoke(
        {
            "question": question,
            "messages": messages,
        }
    )

    text = result.content.strip()

    # remove accidental XML tags
    text = re.sub(r"<[^>]+>", "", text)

    # remove quotes
    text = text.strip("\"' ")

    print("Standalone:", text)

    return text
            
        
def summarize_messages(
    summary,
    messages,
):

    result = summary_chain.invoke(
        {
            "summary": summary,
            "messages": messages,
        }
    )

    return result.content.strip()   
              
            
            