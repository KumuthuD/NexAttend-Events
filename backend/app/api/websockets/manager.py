from fastapi import WebSocket
from typing import Dict, List
import logging

class ConnectionManager:
    def __init__(self):
        # event_id -> list of connected websockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, event_id: str):
        await websocket.accept()
        if event_id not in self.active_connections:
            self.active_connections[event_id] = []
        self.active_connections[event_id].append(websocket)
        logging.info(f"WebSocket connected to event {event_id}. Total: {len(self.active_connections[event_id])}")

    def disconnect(self, websocket: WebSocket, event_id: str):
        if event_id in self.active_connections:
            if websocket in self.active_connections[event_id]:
                self.active_connections[event_id].remove(websocket)
                logging.info(f"WebSocket disconnected from event {event_id}. Total: {len(self.active_connections[event_id])}")
            if not self.active_connections[event_id]:
                del self.active_connections[event_id]

    async def broadcast_to_event(self, event_id: str, message: dict):
        if event_id in self.active_connections:
            # Create a copy of the list to handle disconnections during iteration
            connections = list(self.active_connections[event_id])
            for connection in connections:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logging.warning(f"Error broadcasting to WS: {e}")
                    self.disconnect(connection, event_id)

manager = ConnectionManager()
