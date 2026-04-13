import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Este archivo hace la misma función que tenías dentro del 'using (var scope = app.Services.CreateScope())' en C#.
# Su propósito es revisar si las colecciones de MongoDB están vacías y, si lo están, meter los datos predeterminados.

async def seed_data():
    MONGO_URL = os.getenv("MONGO_URL", "mongodb://127.0.0.1:27017")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.get_database("SaltimbanquisDB")

    # ----- 1. CREACIÓN DE TARIFAS POR DEFECTO -----
    # db.tarifas.count_documents({}) cuenta cuantas tarifas existen.
    tarifas_count = await db.tarifas.count_documents({})
    if tarifas_count == 0:
        # Array de diccionarios en Python = Lista de objetos en C#
        tarifas_iniciales = [
            { "categoria": "juego", "nombre": "Bebé", "subtitulo": "Hasta 2 años", "precio": 0.0, "sufijoPrecio": "", "nota": "Acompañado de adulto", "imagenUrl": "assets/tarifa_bebe.png" },
            { "categoria": "juego", "nombre": "Infantil", "subtitulo": "3 – 12 años", "precio": 8.0, "sufijoPrecio": " €/hora", "nota": "Calcetines incluidos", "imagenUrl": "assets/tarifa_infantil.png" },
            { "categoria": "juego", "nombre": "Junior/Adulto", "subtitulo": "13+ años", "precio": 10.0, "sufijoPrecio": " €/hora", "nota": "Calcetines incluidos", "destacado": True, "etiquetaDestacado": "⭐ Más popular", "imagenUrl": "assets/tarifa_junior.png" },
            { "categoria": "juego", "nombre": "Familiar", "subtitulo": "2 adultos + 2 niños", "precio": 30.0, "sufijoPrecio": " €/hora", "nota": "Ahorra 6€", "imagenUrl": "assets/tarifa_familiar.png" },
            { "categoria": "cumple", "nombre": "Pack Básico", "subtitulo": "Hasta 10 niños", "precio": 150.0, "sufijoPrecio": " €", "nota": "1h trampolín + sala + tarta", "imagenUrl": "assets/servicio_cumpleanos.png" },
            { "categoria": "cumple", "nombre": "Pack Premium", "subtitulo": "Hasta 15 niños", "precio": 220.0, "sufijoPrecio": " €", "nota": "2h trampolín + sala + catering", "destacado": True, "etiquetaDestacado": "⭐ Recomendado", "imagenUrl": "assets/servicio_fiesta_privada.png" },
            { "categoria": "excursion", "nombre": "Grupo escolar", "subtitulo": "Mínimo 20 alumnos", "precio": 7.0, "sufijoPrecio": " €/niño", "nota": "Monitor incluido", "imagenUrl": "assets/servicio_excursiones.png" },
            { "categoria": "excursion", "nombre": "Grupo premium", "subtitulo": "Mínimo 30 personas", "precio": 9.0, "sufijoPrecio": " €/pers.", "nota": "Monitor + snack", "imagenUrl": "assets/servicio_fiesta_privada.png" }
        ]
        # InsertMany de C# es insert_many en Motor Python.
        await db.tarifas.insert_many(tarifas_iniciales)
        print("Tarifas iniciales insertadas.")

    # ----- 2. CREACIÓN DE CENTROS POR DEFECTO -----
    centros_count = await db.centros.count_documents({})
    if centros_count == 0:
        centros_iniciales = [
            {
                "nombre": "Saltimbanquis club Barajas",
                "ubicacion": "Calle Campezo, 3 (Local 6) · 28022 San Blas-Canillejas, Madrid",
                "ofertas": [
                    { "titulo": "Cumpleaños", "descripcion": "Paquetes personalizados para celebrar tu día especial con trampolines.", "imagenUrl": "assets/servicio_cumpleanos.png", "enlaceHref": "/barajas/cumpleanos" },
                    { "titulo": "Excursiones", "descripcion": "Grupos escolares y organizados con monitor incluido.", "imagenUrl": "assets/servicio_excursiones.png", "enlaceHref": "/barajas/excursiones" },
                    { "titulo": "Fiestas privadas", "descripcion": "Alquila el parque completo para tu evento único.", "imagenUrl": "assets/Privada.png", "enlaceHref": "/barajas/fiesta-privada" },
                    { "titulo": "Instalaciones", "descripcion": "Amplias zonas de trampolines, foam pit y mucho más.", "imagenUrl": "assets/instalaciones.png", "enlaceHref": "/barajas/instalaciones" }
                ]
            },
            {
                "nombre": "Saltimbanquis club Boadilla",
                "ubicacion": "Avenida Siglo XXI, 15 · 28660 Boadilla del Monte, Madrid",
                "ofertas": [
                    { "titulo": "Cumpleaños", "descripcion": "Festeja tu cumpleaños saltando por los aires.", "imagenUrl": "assets/servicio_cumpleanos.png", "enlaceHref": "/boadilla/cumpleanos" },
                    { "titulo": "Actividades Infantiles", "descripcion": "Juegos guiados por especialistas en Boadilla.", "imagenUrl": "assets/tarifa_infantil.png", "enlaceHref": "/boadilla/actividades" }
                ]
            }
        ]
        await db.centros.insert_many(centros_iniciales)
        print("Centros iniciales insertados.")

# Si ejecutásemos este archivo individualmente (python seed.py), haría la siembra sin arrancar el servidor.
if __name__ == "__main__":
    asyncio.run(seed_data())
