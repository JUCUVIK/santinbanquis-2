from fastapi import APIRouter, Depends
from src.shared.database import get_db
from .domain import User, LoginRequest, GoogleLoginRequest
from .infrastructure import MongoUserRepository
from .application import AuthService

router = APIRouter()

def get_auth_service(db=Depends(get_db)):
    repo = MongoUserRepository(db)
    return AuthService(repo)

@router.post("/api/register")
async def register(user: User, service: AuthService = Depends(get_auth_service)):
    return await service.register(user)

@router.post("/api/login")
async def login(req: LoginRequest, service: AuthService = Depends(get_auth_service)):
    return await service.login(req)

@router.post("/api/login/google")
async def login_google(req: GoogleLoginRequest, service: AuthService = Depends(get_auth_service)):
    return await service.login_google(req)
