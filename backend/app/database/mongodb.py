import motor.motor_asyncio
from app.core.config import settings
import logging

client = None
db = None

async def connect_db():
    global client, db
    try:
        logging.info("Connecting to MongoDB...")
        client = motor.motor_asyncio.AsyncIOMotorClient(
            settings.MONGODB_URL, 
            tls=settings.MONGODB_TLS
        )
        db = client[settings.DATABASE_NAME]
        logging.info("Connected to MongoDB successfully.")
    except Exception as e:
        logging.error(f"Error connecting to MongoDB: {e}")

async def close_db():
    global client
    if client:
        client.close()
        logging.info("Closed MongoDB connection.")

def get_database():
    return db
