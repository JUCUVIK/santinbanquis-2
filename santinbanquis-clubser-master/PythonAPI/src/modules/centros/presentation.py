from fastapi import APIRouter, Depends
from typing import List
from src.shared.database import get_db
from .domain import Centro
from .infrastructure import MongoCentroRepository
from .application import CentroService

router = APIRouter()

def get_centro_service(db=Depends(get_db)):
    repo = MongoCentroRepository(db)
    return CentroService(repo)

@router.get("/api/centros", response_model=List[Centro])
async def get_centros(service: CentroService = Depends(get_centro_service)):
    return await service.get_all()

@router.post("/api/centros", response_model=Centro)
async def create_centro(centro: Centro, service: CentroService = Depends(get_centro_service)):
    return await service.create(centro)

@router.delete("/api/centros/{centro_id}")
async def delete_centro(centro_id: str, service: CentroService = Depends(get_centro_service)):
    await service.delete(centro_id)
    return {"message": "Centro eliminado"}
