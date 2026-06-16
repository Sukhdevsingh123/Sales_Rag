from sqlalchemy import text
from app.core.database import engine

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("Connected:", result.scalar())

except Exception as e:
    print("Error:", e)