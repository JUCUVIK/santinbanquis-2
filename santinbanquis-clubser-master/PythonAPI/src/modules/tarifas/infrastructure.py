from .ports import ITarifaRepository
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

class MongoTarifaRepository(ITarifaRepository):
    def __init__(self, db: AsyncIOMotorDatabase):
        self._collection = db.tarifas

    async def fetch_all(self) -> list:
        return await self._collection.find({}).to_list(length=100)

    async def insert(self, tarifa_dict: dict) -> dict:
        res = await self._collection.insert_one(tarifa_dict)
        tarifa_dict["_id"] = res.inserted_id
        return tarifa_dict
        
    async def delete(self, id: str) -> None:
        await self._collection.delete_one({"_id": ObjectId(id)})
