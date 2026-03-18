from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.mongodb import connect_db, close_db
# from app.api.routes import auth, events, forms, registrations, scanner, export, health

app = FastAPI(title="NexAttend Events API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# # Include routers
# app.include_router(health.router, prefix="/api/v1", tags=["Health"])
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
# app.include_router(events.router, prefix="/api/v1/events", tags=["Events"])
# app.include_router(registrations.router, prefix="/api/v1/registrations", tags=["Registrations"])
# app.include_router(scanner.router, prefix="/api/v1/scanner", tags=["Scanner"])
# app.include_router(export.router, prefix="/api/v1/export", tags=["Export"])

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()
