from pydantic import BaseModel, Field
from typing import List, Optional

class OfertaCentro(BaseModel):
    titulo: str = ""
    descripcion: str = ""
    imagenUrl: str = ""
    enlaceHref: str = ""

class Centro(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    nombre: str = ""
    ubicacion: str = ""
    descripcion: str = ""
    telefono: str = ""
    email: str = ""
    tarifasIds: List[str] = []
    ofertas: List[OfertaCentro] = []
    additionalElements: Optional[dict] = None

    class Config:
        populate_by_name = True
