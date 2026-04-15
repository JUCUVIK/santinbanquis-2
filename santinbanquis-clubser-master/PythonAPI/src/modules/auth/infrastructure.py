from .ports import IUserRepository
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

class MongoUserRepository(IUserRepository):
    def __init__(self, db: AsyncIOMotorDatabase):
        self._collection = db.users

    async def find_by_email(self, email: str) -> dict:
        return await self._collection.find_one({"email": email})

    async def insert(self, user_dict: dict) -> dict:
        res = await self._collection.insert_one(user_dict)
        user_dict["_id"] = res.inserted_id
        return user_dict
        
    async def get_by_id(self, id: str) -> dict:
        return await self._collection.find_one({"_id": ObjectId(id)})
