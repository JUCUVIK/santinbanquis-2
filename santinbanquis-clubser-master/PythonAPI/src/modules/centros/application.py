from .domain import Centro
from .ports import ICentroRepository
from typing import List

class CentroService:
    def __init__(self, repo: ICentroRepository):
        self.repo = repo

    async def get_all(self) -> List[dict]:
        centros = await self.repo.fetch_all()
        for c in centros:
            c["_id"] = str(c["_id"])
        return centros

    async def create(self, centro: Centro) -> Centro:
        nuevo_dict = centro.model_dump(by_alias=True, exclude={"id"})
        saved = await self.repo.insert(nuevo_dict)
        centro.id = str(saved["_id"])
        return centro

    async def delete(self, centro_id: str):
        await self.repo.delete(centro_id)
