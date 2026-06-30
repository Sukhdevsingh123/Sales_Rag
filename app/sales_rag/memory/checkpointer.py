from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from app.core.config import DATABASE_URL


def create_checkpointer():
    """
    Returns an AsyncPostgresSaver context manager.

    Connection is opened inside FastAPI lifespan.
    """

    return AsyncPostgresSaver.from_conn_string(
        DATABASE_URL
    )