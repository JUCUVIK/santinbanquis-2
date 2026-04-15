from abc import ABC, abstractmethod
from typing import List

class ITarifaRepository(ABC):
    @abstractmethod
    async def fetch_all(self) -> List[dict]:
        pass

    @abstractmethod
    async def insert(self, tarifa_dict: dict) -> dict:
        pass
        
    @abstractmethod
    async def delete(self, id: str) -> None:
        pass
