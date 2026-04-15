from .ports import IEmailService
from .domain import ContactoDto
import smtplib
from email.message import EmailMessage
import os

class SmtpEmailService(IEmailService):
    def send_contact_email(self, contacto: ContactoDto) -> None:
        server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        port = int(os.getenv("SMTP_PORT", "587"))
        sender = os.getenv("SMTP_USER", "infosaltimbanquisclub@gmail.com")
        password = os.getenv("SMTP_PASSWORD", "")
        
        msg = EmailMessage()
        msg.set_content(f"Has recibido un nuevo mensaje de contacto.\n\nNombre: {contacto.nombre}\nEmail: {contacto.email}\nCentro: {contacto.centroId}\n\nMensaje:\n{contacto.mensaje}")
        msg['Subject'] = f"Nuevo mensaje de contacto de: {contacto.nombre}"
        msg['From'] = sender
        msg['To'] = "info@saltimbanquisclub.com"
        
        s = smtplib.SMTP(server, port)
        s.starttls()
        if password: s.login(sender, password)
        s.send_message(msg)
        s.quit()
