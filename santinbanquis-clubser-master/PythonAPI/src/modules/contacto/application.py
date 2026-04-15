from .domain import ContactoDto
from .ports import IEmailService

class ContactoService:
    def __init__(self, email_service: IEmailService):
        self.email_service = email_service

    def procesar_contacto(self, contacto: ContactoDto) -> None:
        # Aquí se podría validar si el sender no está baneado, si el texto es ofensivo, etc.
        self.email_service.send_contact_email(contacto)
