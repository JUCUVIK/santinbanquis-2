from fastapi import APIRouter, Depends, status
from typing import List
from src.shared.database import get_db
from .domain import Reserva
from .infrastructure import MongoReservaRepository
from .application import ReservaService

router = APIRouter()

def get_reserva_service(db=Depends(get_db)): return ReservaService(MongoReservaRepository(db))

@router.get("/api/reservas", response_model=List[Reserva])
async def get_all_reservas(service: ReservaService = Depends(get_reserva_service)): return await service.get_all()

@router.get("/api/reservas/{usuario_id}")
async def get_user_reservas(usuario_id: str, service: ReservaService = Depends(get_reserva_service)): return await service.get_by_user(usuario_id)

@router.post("/api/reservas", status_code=status.HTTP_201_CREATED)
async def create_reserva(reserva: Reserva, service: ReservaService = Depends(get_reserva_service)): return await service.create(reserva)

@router.delete("/api/reservas/{id}")
async def delete_reserva(id: str, service: ReservaService = Depends(get_reserva_service)):
    await service.delete(id)
    return {"message": "Eliminada"}
