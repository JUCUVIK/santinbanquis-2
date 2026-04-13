from pydantic import BaseModel, Field
from typing import List, Optional

# BaseModel de Pydantic es el equivalente a definir clases en C#.
# Nos permite validar que los datos que entran JSON tienen el tipo y formato correcto.

class Tarifa(BaseModel):
    # En MongoDB el ID siempre se guarda como '_id'. Usamos "alias='_id'" para que Python lo pueda 
    # manejar en esta clase automáticamente.
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
        populate_by_name = True # Permite rellenar usando 'id' o '_id'

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
    # Usamos List[OfertaCentro] para decirle a Pydantic que esto es una lista de la clase OfertaCentro.
    ofertas: List[OfertaCentro] = []
    additionalElements: Optional[dict] = None

    class Config:
        populate_by_name = True

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

class User(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    nombre: str = ""
    apellidos: str = ""
    email: str = ""
    password: str = ""
    centroFavorito: str = ""

    class Config:
        populate_by_name = True

# Estos DTO (Data Transfer Object) se usan para recibir datos del Frontend 
# pero que no se guardan directamente como una "tabla" en Base de datos interactuando como MongoDB.

class ContactoDto(BaseModel):
    nombre: str = ""
    email: str = ""
    centroId: str = ""
    mensaje: str = ""

class LoginRequest(BaseModel):
    email: str = ""
    password: str = ""

class GoogleLoginRequest(BaseModel):
    email: str = ""
    nombre: str = ""
    apellidos: str = ""
    googleId: str = ""
