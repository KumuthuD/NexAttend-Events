from fastapi import APIRouter, Depends
from app.api.deps import get_db

router = APIRouter()


@router.get("/health")
async def health_check(db=Depends(get_db)):
    """Health check endpoint — verifies server and database are alive."""
    try:
        # Ping the database to confirm connectivity
        await db.command("ping")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return {
        "status": "ok",
        "database": db_status,
    }
