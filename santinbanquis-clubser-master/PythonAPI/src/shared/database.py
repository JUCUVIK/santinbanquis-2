import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.getenv("MONGO_URL", "mongodb://127.0.0.1:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.get_database("SaltimbanquisDB")

def get_db():
    return db
