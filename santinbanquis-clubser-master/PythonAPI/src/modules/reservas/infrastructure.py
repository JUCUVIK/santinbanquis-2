from .ports import IReservaRepository
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

class MongoReservaRepository(IReservaRepository):
    def __init__(self, db: AsyncIOMotorDatabase):
        self._collection = db.reservas

    async def fetch_all(self) -> list:
        return await self._collection.find({}).to_list(length=100)
        
    async def fetch_by_user(self, decoded_id: str, raw_id: str) -> list:
        return await self._collection.find({"$or": [{"usuarioId": decoded_id}, {"usuarioId": raw_id}]}).to_list(length=100)

    async def insert(self, reserva_dict: dict) -> dict:
        res = await self._collection.insert_one(reserva_dict)
        reserva_dict["_id"] = res.inserted_id
        return reserva_dict
        
    async def delete(self, id: str) -> None:
        await self._collection.delete_one({"_id": ObjectId(id)})
