from app.sales_rag.llm.ollama_llm import rewrite_question


def rewrite_node(state):

    standalone = rewrite_question(

        question=state["question"],

        messages=state.get("messages", []),

    )

    return {

        "standalone_question": standalone

    }