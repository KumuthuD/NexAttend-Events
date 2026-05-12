from fastapi import APIRouter, Depends
from app.api.deps import get_db
import time

router = APIRouter()


@router.get("/health")
async def health_check(db=Depends(get_db)):
    """Enhanced health check — verifies server, database, and includes DB latency."""
    db_status = "disconnected"
    db_latency_ms = None

    try:
        start = time.monotonic()
        await db.command("ping")
        db_latency_ms = round((time.monotonic() - start) * 1000, 2)
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return {
        "status": "ok",
        "version": "1.0.0",
        "database": db_status,
        "db_latency_ms": db_latency_ms,
    }
