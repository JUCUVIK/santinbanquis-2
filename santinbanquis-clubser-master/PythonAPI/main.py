from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from seed import seed_data

from src.modules.auth.presentation import router as auth_router
from src.modules.centros.presentation import router as centros_router
from src.modules.tarifas.presentation import router as tarifas_router
from src.modules.reservas.presentation import router as reservas_router
from src.modules.contacto.presentation import router as contacto_router

app = FastAPI(title="Saltimbanquis API (Hexagonal)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await seed_data()

@app.get("/")
def home():
    return "¡API de Saltimbanquis club funcionando con Arquitectura Hexagonal Vertical Slicing!"

# Montar todos los routers de los dominios
app.include_router(auth_router)
app.include_router(centros_router)
app.include_router(tarifas_router)
app.include_router(reservas_router)
app.include_router(contacto_router)
