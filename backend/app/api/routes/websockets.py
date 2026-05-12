from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, HTTPException
from app.api.websockets.manager import manager
from app.api.deps import get_db
from jose import JWTError
from app.core.security import decode_access_token

router = APIRouter()

async def verify_ws_token(token: str, db):
    try:
        payload = decode_access_token(token)
        email: str = payload.get("sub")
        if email is None:
            return None
        return await db["users"].find_one({"email": email})
    except Exception:
        return None

@router.websocket("/{event_id}")
async def websocket_event_endpoint(
    websocket: WebSocket, 
    event_id: str, 
    token: str = Query(...),
    db = Depends(get_db)
):
    user = await verify_ws_token(token, db)
    if not user:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    # Verify event belongs to user
    from bson import ObjectId
    event = await db["events"].find_one({"_id": ObjectId(event_id)})
    if not event or str(event["creator_id"]) != str(user["_id"]):
        await websocket.close(code=4003, reason="Forbidden")
        return

    await manager.connect(websocket, event_id)
    try:
        while True:
            # Keep connection alive and handle pings
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, event_id)
