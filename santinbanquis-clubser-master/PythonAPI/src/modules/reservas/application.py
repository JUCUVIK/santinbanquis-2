from .domain import Reserva
from .ports import IReservaRepository
from typing import List
import random
import urllib.parse

class ReservaService:
    def __init__(self, repo: IReservaRepository):
        self.repo = repo

    async def get_all(self) -> List[dict]:
        reservas = await self.repo.fetch_all()
        for r in reservas: r["_id"] = str(r["_id"])
        return reservas
        
    async def get_by_user(self, usuario_id: str) -> List[dict]:
        decoded_id = urllib.parse.unquote(usuario_id)
        reservas = await self.repo.fetch_by_user(decoded_id, usuario_id)
        for r in reservas: r["_id"] = str(r["_id"])
        return reservas

    async def create(self, reserva: Reserva) -> dict:
        reserva.numeroReserva = str(random.randint(10000, 99999))
        reserva.estado = "PRÓXIMA"
        if not reserva.usuarioId: reserva.usuarioId = "invitado@hopgalaxy.com"
            
        nuevo_dict = reserva.model_dump(by_alias=True, exclude={"id"})
        saved = await self.repo.insert(nuevo_dict)
        reserva.id = str(saved["_id"])
        return {"error": False, "message": "Reserva creada con éxito.", "reserva": reserva}

    async def delete(self, id: str):
        await self.repo.delete(id)
