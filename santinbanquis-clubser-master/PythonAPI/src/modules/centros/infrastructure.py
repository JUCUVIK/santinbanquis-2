from .ports import ICentroRepository
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

class MongoCentroRepository(ICentroRepository):
    def __init__(self, db: AsyncIOMotorDatabase):
        self._collection = db.centros

    async def fetch_all(self) -> list:
        return await self._collection.find({}).to_list(length=100)

    async def insert(self, centro_dict: dict) -> dict:
        res = await self._collection.insert_one(centro_dict)
        centro_dict["_id"] = res.inserted_id
        return centro_dict
        
    async def delete(self, centro_id: str) -> None:
        await self._collection.delete_one({"_id": ObjectId(centro_id)})
