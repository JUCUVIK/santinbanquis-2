from pydantic import BaseModel, Field
from typing import Optional

class Tarifa(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    categoria: str = ""
    nombre: str = ""
    subtitulo: str = ""
    precio: float = 0
    sufijoPrecio: str = ""
    nota: str = ""
    destacado: bool = False
    etiquetaDestacado: str = ""
    imagenUrl: str = ""

    class Config:
        populate_by_name = True
