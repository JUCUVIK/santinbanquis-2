from fastapi import APIRouter, Depends
from typing import List
from src.shared.database import get_db
from .domain import Tarifa
from .infrastructure import MongoTarifaRepository
from .application import TarifaService

router = APIRouter()

def get_tarifa_service(db=Depends(get_db)): return TarifaService(MongoTarifaRepository(db))

@router.get("/api/tarifas", response_model=List[Tarifa])
async def get_tarifas(service: TarifaService = Depends(get_tarifa_service)): return await service.get_all()

@router.post("/api/tarifas", response_model=Tarifa)
async def create_tarifa(tarifa: Tarifa, service: TarifaService = Depends(get_tarifa_service)): return await service.create(tarifa)

@router.delete("/api/tarifas/{tarifa_id}")
async def delete_tarifa(tarifa_id: str, service: TarifaService = Depends(get_tarifa_service)):
    await service.delete(tarifa_id)
    return {"message": "Tarifa eliminada"}
