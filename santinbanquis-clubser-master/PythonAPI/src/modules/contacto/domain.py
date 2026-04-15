from pydantic import BaseModel

class ContactoDto(BaseModel):
    nombre: str = ""
    email: str = ""
    centroId: str = ""
    mensaje: str = ""
