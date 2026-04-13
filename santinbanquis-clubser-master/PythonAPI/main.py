from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from bson import ObjectId
import random

# Importamos nuestros DTOs (Pydantic Models) y generador de inyección de DB
from models import Tarifa, Centro, Reserva, User, ContactoDto, LoginRequest, GoogleLoginRequest
from database import get_db

# Inicializamos el servidor de FastAPI (equivalente a builder.Build() en C# Minimal API)
app = FastAPI(title="Saltimbanquis API (Python/FastAPI)")

# ========================
# CONFIGURACIÓN CORS
# ========================
# Permitimos que cualquier origen (*) se comunique con nuestra API, 
# para que Angular no dé bloqueos de CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from seed import seed_data

# ========================
# EVENTO DE ARRANQUE
# ========================
# Cuando Uvicorn (nuestro servidor) levante la app, esto se ejecutará automáticamente.
# Ejecutará la función que rellena los centros y tarifas principales si no existen.
@app.on_event("startup")
async def startup_event():
    await seed_data()

# Ruta base por si accedes en el navegador directamente a http://127.0.0.1:8000/
@app.get("/")
def home():
    return "¡API de Saltimbanquis club funcionando con FastAPI y MongoDB!"

# ========================
# ENDPOINTS DE CENTROS
# ========================

@app.get("/api/centros", response_model=List[Centro])
async def get_centros(db=Depends(get_db)): # Usa Depends(get_db) igual que tu db de inyección de dependencias MongoDBContext
    cursor = db.centros.find({})
    centros_list = await cursor.to_list(length=100)
    # MongoDB guarda el ID como un objeto ObjectId, lo convertimos a texto para mandarlo al frontend
    for c in centros_list:
        c["_id"] = str(c["_id"])
    return centros_list

@app.post("/api/centros", response_model=Centro)
async def create_centro(centro: Centro, db=Depends(get_db)):
    # dump_model convierte nuestra clase Pydantic de Python a un diccionario para grabarlo
    nuevo_centro_dict = centro.model_dump(by_alias=True, exclude={"id"})
    await db.centros.insert_one(nuevo_centro_dict)
    centro.id = str(nuevo_centro_dict["_id"])
    return centro

@app.delete("/api/centros/{centro_id}")
async def delete_centro(centro_id: str, db=Depends(get_db)):
    await db.centros.delete_one({"_id": ObjectId(centro_id)})
    return {"message": "Centro eliminado"}

# ========================
# ENDPOINTS DE TARIFAS
# ========================

@app.get("/api/tarifas", response_model=List[Tarifa])
async def get_tarifas(db=Depends(get_db)):
    cursor = db.tarifas.find({})
    tarifas_list = await cursor.to_list(length=100)
    for t in tarifas_list:
        t["_id"] = str(t["_id"])
    return tarifas_list

@app.post("/api/tarifas", response_model=Tarifa)
async def create_tarifa(tarifa: Tarifa, db=Depends(get_db)):
    nueva_tarifa_dict = tarifa.model_dump(by_alias=True, exclude={"id"})
    await db.tarifas.insert_one(nueva_tarifa_dict)
    tarifa.id = str(nueva_tarifa_dict["_id"])
    return tarifa

@app.delete("/api/tarifas/{tarifa_id}")
async def delete_tarifa(tarifa_id: str, db=Depends(get_db)):
    await db.tarifas.delete_one({"_id": ObjectId(tarifa_id)})
    return {"message": "Tarifa eliminada"}

# ========================
# ENDPOINTS DE RESERVAS 
# Equivalente a ReservasController.cs
# ========================

@app.get("/api/reservas", response_model=List[Reserva])
async def get_all_reservas(db=Depends(get_db)):
    cursor = db.reservas.find({})
    reservas = await cursor.to_list(length=100)
    for r in reservas: r["_id"] = str(r["_id"])
    return reservas

@app.get("/api/reservas/{usuario_id}")
async def get_user_reservas(usuario_id: str, db=Depends(get_db)):
    import urllib.parse
    # Descodificamos el ID visualmente por si Angular manda un email codificado con %20 o @ escapeado
    decoded_id = urllib.parse.unquote(usuario_id)
    # Busca reservas asociadas exactamente al ID decodificado o literal enviado en URL
    cursor = db.reservas.find({"$or": [{"usuarioId": decoded_id}, {"usuarioId": usuario_id}]})
    reservas = await cursor.to_list(length=100)
    for r in reservas: r["_id"] = str(r["_id"])
    return reservas

@app.post("/api/reservas", status_code=status.HTTP_201_CREATED)
async def create_reserva(reserva: Reserva, db=Depends(get_db)):
    # Genera un número aleatorio para la reserva entre el 10000 y 99999
    reserva.numeroReserva = str(random.randint(10000, 99999))
    reserva.estado = "PRÓXIMA"
    
    # Asigna usuario por defecto si no viene rellenado
    if not reserva.usuarioId:
        reserva.usuarioId = "invitado@hopgalaxy.com"
        
    nueva_reserva_dict = reserva.model_dump(by_alias=True, exclude={"id"})
    await db.reservas.insert_one(nueva_reserva_dict)
    reserva.id = str(nueva_reserva_dict["_id"])
    
    # Return tal y como pedía Angular ({ error: false, message: ... })
    return {"error": False, "message": "Reserva creada con éxito.", "reserva": reserva}

@app.delete("/api/reservas/{id}")
async def delete_reserva(id: str, db=Depends(get_db)):
    await db.reservas.delete_one({"_id": ObjectId(id)})
    return {"message": "Eliminada"}

# ========================
# ENDPOINT DE CONTACTO (SMTP EMAIL)
# ========================

@app.post("/api/contacto")
async def enviar_contacto(contacto: ContactoDto):
    import smtplib
    from email.message import EmailMessage
    import os
    
    # Pillamos los datos de SMTP que tenías antes en appsettings.json
    server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    port = int(os.getenv("SMTP_PORT", "587"))
    sender = os.getenv("SMTP_USER", "infosaltimbanquisclub@gmail.com")
    password = os.getenv("SMTP_PASSWORD", "")
    
    msg = EmailMessage()
    msg.set_content(f"Has recibido un nuevo mensaje de contacto.\\n\\nNombre: {contacto.nombre}\\nEmail: {contacto.email}\\nCentro: {contacto.centroId}\\n\\nMensaje:\\n{contacto.mensaje}")
    msg['Subject'] = f"Nuevo mensaje de contacto de: {contacto.nombre}"
    msg['From'] = sender
    msg['To'] = "info@saltimbanquisclub.com"
    
    try:
        # Aquí se realiza la conexión y login. Sustituye MailKit.Net.Smtp.SmtpClient
        s = smtplib.SMTP(server, port)
        s.starttls()
        # Gmail pide contraseña, así que envialo si hay un env configurado.
        if password:
            s.login(sender, password)
        s.send_message(msg)
        s.quit()
    except Exception as e:
        print(f"Error enviando correo: {e}")
        # Retornamos error 500 (Problem() en tu C#) si falla el email
        raise HTTPException(status_code=500, detail="Ocurrió un error al enviar el mensaje de contacto.")
        
    return {"message": "Mensaje enviado correctamente a la empresa."}

# ========================
# AUTH (AuthController.cs)
# ========================
from passlib.context import CryptContext

# Creamos el objeto que sabe cifrar contraseñas (Equivalente al PasswordHasher de Identity en .NET)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@app.post("/api/register")
async def register(user: User, db=Depends(get_db)):
    if not user.email or not user.password:
        return {"error": True, "message": "El Email y la Contraseña son obligatorios."}
        
    existing = await db.users.find_one({"email": user.email})
    if existing:
        return {"error": True, "message": "El email ya está registrado."}
        
    # Hasheamos la contraseña antes de guardarla.
    user.password = pwd_context.hash(user.password)
    user_dict = user.model_dump(by_alias=True, exclude={"id"})
    await db.users.insert_one(user_dict)
    
    # El usuario se inyectó. El ID queda en _id
    return {"error": False, "message": "Cuenta creada con éxito.", "userId": str(user_dict["_id"])}

@app.post("/api/login")
async def login(req: LoginRequest, db=Depends(get_db)):
    if not req.email or not req.password:
        return {"error": True, "message": "Debes enviar el Email y la Contraseña."}
        
    user = await db.users.find_one({"email": req.email})
    if not user:
        # Devuelve Unauthorized genérico si no encuentra el mail para evitar fugas de información
        return {"error": True, "message": "Email o contraseña incorrectos."}
        
    # Compara la contraseña limpia del frontend con el Hash raro de MongoDB
    if not pwd_context.verify(req.password, user["password"]):
        return {"error": True, "message": "Email o contraseña incorrectos."}
        
    return {"error": False, "message": "Inicio de sesión exitoso.", "id": str(user["_id"]), "nombre": user.get("nombre", ""), "email": user.get("email", "")}

@app.post("/api/login/google")
async def login_google(req: GoogleLoginRequest, db=Depends(get_db)):
    if not req.email:
        return {"error": True, "message": "Falta el email en el token de Google."}
        
    user = await db.users.find_one({"email": req.email})
    if not user:
        # Si la cuenta Google no existía, configuramos un User nuevo sin password.
        new_user = {
            "email": req.email,
            "nombre": req.nombre,
            "apellidos": req.apellidos,
            "password": "",
            "centroFavorito": ""
        }
        res = await db.users.insert_one(new_user)
        user = await db.users.find_one({"_id": res.inserted_id})
        
    # Para no exponer el _id y que Angular lo sepa leer, lo empaquetamos
    user["id"] = str(user["_id"])
    del user["_id"]
    return {"error": False, "message": "Inicio de sesión exitoso con Google.", "id": user["id"], "nombre": user.get("nombre", ""), "user": user}
