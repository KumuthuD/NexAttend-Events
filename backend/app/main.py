from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging

import os

from app.database.mongodb import connect_db, close_db, get_database
from app.database.indexes import create_indexes
from app.api.routes import auth, events, forms, registrations, scanner, export, health

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="NexAttend Events API",
    description="The official API for the NexAttend Events attendance management platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception caught: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected internal server error occurred. Please try again later."},
    )

# Include routers
app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(events.router, prefix="/api/v1/events", tags=["Events"])
app.include_router(forms.router, prefix="/api/v1", tags=["Forms"])
app.include_router(registrations.router, prefix="/api/v1", tags=["Registrations"])
app.include_router(scanner.router, prefix="/api/v1/scanner", tags=["Scanner"])
app.include_router(export.router, prefix="/api/v1/export", tags=["Export"])

@app.on_event("startup")
async def startup():
    logger.info("Starting up NexAttend Events API...")
    await connect_db()
    db = get_database()
    if db is not None:
        await create_indexes(db)
        logger.info("Startup complete.")

@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down NexAttend Events API...")
    await close_db()
    logger.info("Shutdown complete.")
