from abc import ABC, abstractmethod
from typing import Optional

class IUserRepository(ABC):
    @abstractmethod
    async def find_by_email(self, email: str) -> Optional[dict]:
        pass

    @abstractmethod
    async def insert(self, user_dict: dict) -> dict:
        pass
    
    @abstractmethod
    async def get_by_id(self, id: str) -> Optional[dict]:
        pass
