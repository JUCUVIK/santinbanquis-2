from .domain import Tarifa
from .ports import ITarifaRepository
from typing import List

class TarifaService:
    def __init__(self, repo: ITarifaRepository):
        self.repo = repo

    async def get_all(self) -> List[dict]:
        tarifas = await self.repo.fetch_all()
        for t in tarifas: t["_id"] = str(t["_id"])
        return tarifas

    async def create(self, tarifa: Tarifa) -> Tarifa:
        nuevo_dict = tarifa.model_dump(by_alias=True, exclude={"id"})
        saved = await self.repo.insert(nuevo_dict)
        tarifa.id = str(saved["_id"])
        return tarifa

    async def delete(self, tarifa_id: str):
        await self.repo.delete(tarifa_id)
