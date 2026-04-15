from pydantic import BaseModel, Field
from typing import Optional

class User(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    nombre: str = ""
    apellidos: str = ""
    email: str = ""
    password: str = ""
    centroFavorito: str = ""

    class Config:
        populate_by_name = True

class LoginRequest(BaseModel):
    email: str = ""
    password: str = ""

class GoogleLoginRequest(BaseModel):
    email: str = ""
    nombre: str = ""
    apellidos: str = ""
    googleId: str = ""
