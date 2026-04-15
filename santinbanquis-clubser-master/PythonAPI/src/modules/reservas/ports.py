from abc import ABC, abstractmethod
from typing import List

class IReservaRepository(ABC):
    @abstractmethod
    async def fetch_all(self) -> List[dict]:
        pass
        
    @abstractmethod
    async def fetch_by_user(self, decoded_id: str, raw_id: str) -> List[dict]:
        pass

    @abstractmethod
    async def insert(self, reserva_dict: dict) -> dict:
        pass
        
    @abstractmethod
    async def delete(self, id: str) -> None:
        pass
