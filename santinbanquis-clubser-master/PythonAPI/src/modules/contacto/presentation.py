from fastapi import APIRouter, HTTPException
from .domain import ContactoDto
from .infrastructure import SmtpEmailService
from .application import ContactoService

router = APIRouter()

def get_contacto_service(): return ContactoService(SmtpEmailService())

@router.post("/api/contacto")
async def enviar_contacto(contacto: ContactoDto):
    service = get_contacto_service()
    try:
        # En la vida real harías esto asyncro con aiosmtplib, 
        # pero mantenemos tu flow actual bloqueante por ahora
        service.procesar_contacto(contacto)
        return {"message": "Mensaje enviado correctamente a la empresa."}
    except Exception as e:
        print(f"Error enviando correo: {e}")
        raise HTTPException(status_code=500, detail="Ocurrió un error al enviar el mensaje de contacto.")
