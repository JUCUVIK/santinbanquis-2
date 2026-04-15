from abc import ABC, abstractmethod
from typing import List

class ICentroRepository(ABC):
    @abstractmethod
    async def fetch_all(self) -> List[dict]:
        pass

    @abstractmethod
    async def insert(self, centro_dict: dict) -> dict:
        pass
        
    @abstractmethod
    async def delete(self, centro_id: str) -> None:
        pass
