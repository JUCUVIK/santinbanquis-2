from pydantic import BaseModel, Field
from typing import Optional

class Reserva(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    usuarioId: str = ""
    fechaReserva: str = "" 
    centroSeleccionado: str = ""
    tipoReserva: str = ""
    detalles: str = ""
    numeroReserva: str = ""
    estado: str = ""
    total: float = 0

    class Config:
        populate_by_name = True
