from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.mongodb import connect_db, close_db, get_database
from app.database.indexes import create_indexes
from app.api.routes import forms, registrations

app = FastAPI(title="NexAttend Events API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Form Fields routes — mounted under /api/v1 so paths become /api/v1/events/{id}/fields
app.include_router(forms.router, prefix="/api/v1", tags=["Form Fields"])

# Registration routes — mounted under /api/v1 so paths become:
#   /api/v1/registrations           (POST — public register)
#   /api/v1/events/{id}/registrations  (GET — manager view)
#   /api/v1/registrations/{qr_id}   (GET — public lookup)
app.include_router(registrations.router, prefix="/api/v1", tags=["Registrations"])

# Will be uncommented as other tasks complete:
# from app.api.routes import health, auth, events, scanner, export
# app.include_router(health.router, prefix="/api/v1", tags=["Health"])
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
# app.include_router(events.router, prefix="/api/v1/events", tags=["Events"])
# app.include_router(scanner.router, prefix="/api/v1/scanner", tags=["Scanner"])
# app.include_router(export.router, prefix="/api/v1/export", tags=["Export"])


@app.on_event("startup")
async def startup():
    await connect_db()
    db = get_database()
    if db is not None:
        await create_indexes(db)


@app.on_event("shutdown")
async def shutdown():
    await close_db()
