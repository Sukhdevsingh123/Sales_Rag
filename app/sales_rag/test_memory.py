import asyncio
import uuid

from app.sales_rag.memory.checkpointer import create_checkpointer
from app.sales_rag.graph.graph import get_graph


QUESTIONS = [
    "What is AFF A90?",
    "How much storage does it support?",
    "How many SSDs does it support?",
    "Does it support AI workloads?",
    "What networking ports are available?",
    "Does it support hybrid cloud?",
    "Does it support ransomware protection?",
    "What is the maximum throughput?",
    "Does it support block storage?",
    "Does it support object storage?",
    "What is the controller form factor?",
    "How many nodes can it scale to?",
    "What workloads is it designed for?",
    "What are its upgrade capabilities?",
    "Summarize AFF A90 features.",
]


async def test_memory():

    async with create_checkpointer() as checkpointer:

        await checkpointer.setup()

        graph = await get_graph(checkpointer)

        thread = {
            "configurable": {
                "thread_id": str(uuid.uuid4())
            }
        }

        print("\n")
        print("=" * 80)
        print("THREAD ID :", thread["configurable"]["thread_id"])
        print("=" * 80)

        for i, question in enumerate(QUESTIONS, start=1):

            print("\n")
            print("=" * 80)
            print(f"QUESTION {i}")
            print("=" * 80)

            print(question)
            print()

            result = await graph.ainvoke(
                {
                    "question": question,
                    "context": "",
                    "answer": "",
                    "summary": "",
                    "top_k": 5,
                },
                config=thread,
            )

            print(result["answer"])

            # ----------------------------------------------------
            # Read current graph state from PostgreSQL
            # ----------------------------------------------------

            state = await graph.aget_state(thread)

            print("\n")
            print("-" * 80)
            print("CURRENT GRAPH STATE")
            print("-" * 80)

            print()

            summary = state.values.get("summary", "")

            if summary:
                print("SUMMARY")
                print(summary)
            else:
                print("SUMMARY : <EMPTY>")

            print()

            messages = state.values.get("messages", [])

            print("MESSAGE COUNT :", len(messages))

            print()

            print("LAST MESSAGES")

            for m in messages:
                print(f"{m.__class__.__name__}: {m.content[:120]}")

            print("-" * 80)


if __name__ == "__main__":
    asyncio.run(test_memory())