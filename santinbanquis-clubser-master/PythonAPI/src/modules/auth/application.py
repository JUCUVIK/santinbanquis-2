from .domain import User, LoginRequest, GoogleLoginRequest
from .ports import IUserRepository
from src.shared.security import hash_password, verify_password

class AuthService:
    def __init__(self, repo: IUserRepository):
        self.repo = repo

    async def register(self, user: User) -> dict:
        if not user.email or not user.password:
            return {"error": True, "message": "El Email y la Contraseña son obligatorios."}
            
        existing = await self.repo.find_by_email(user.email)
        if existing:
            return {"error": True, "message": "El email ya está registrado."}
            
        user.password = hash_password(user.password)
        user_dict = user.model_dump(by_alias=True, exclude={"id"})
        saved = await self.repo.insert(user_dict)
        return {"error": False, "message": "Cuenta creada con éxito.", "userId": str(saved["_id"])}

    async def login(self, req: LoginRequest) -> dict:
        if not req.email or not req.password:
            return {"error": True, "message": "Debes enviar el Email y la Contraseña."}
            
        user = await self.repo.find_by_email(req.email)
        if not user or not verify_password(req.password, user["password"]):
            return {"error": True, "message": "Email o contraseña incorrectos."}
            
        return {
            "error": False, 
            "message": "Inicio de sesión exitoso.", 
            "id": str(user["_id"]), 
            "nombre": user.get("nombre", ""), 
            "email": user.get("email", "")
        }

    async def login_google(self, req: GoogleLoginRequest) -> dict:
        if not req.email:
            return {"error": True, "message": "Falta el email en el token de Google."}
            
        user = await self.repo.find_by_email(req.email)
        if not user:
            new_user = {
                "email": req.email,
                "nombre": req.nombre,
                "apellidos": req.apellidos,
                "password": "",
                "centroFavorito": ""
            }
            user = await self.repo.insert(new_user)
            
        user["id"] = str(user["_id"])
        del user["_id"]
        return {"error": False, "message": "Inicio de sesión exitoso con Google.", "id": user["id"], "nombre": user.get("nombre", ""), "user": user}
