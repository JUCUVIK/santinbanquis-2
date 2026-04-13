import os
from motor.motor_asyncio import AsyncIOMotorClient

# Obtenemos la URL de conexión a MongoDB. 
# Si no hay variable de entorno llamada MONGO_URL, usa localhost por defecto.
MONGO_URL = os.getenv("MONGO_URL", "mongodb://127.0.0.1:27017")

# Inicializamos el cliente asíncrono de Motor (driver de MongoDB para Python)
client = AsyncIOMotorClient(MONGO_URL)

# Seleccionamos explícitamente la base de datos "SaltimbanquisDB".
# En MongoDB, si no existe, se creará automáticamente en cuanto guardes el primer dato.
db = client.get_database("SaltimbanquisDB") 

# Esta función la usaremos en main.py para "inyectar" la base de datos 
# en cada Endpoint que lo necesite (como una inyección de dependencias en C#)
def get_db():
    return db
