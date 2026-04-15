from abc import ABC, abstractmethod
from .domain import ContactoDto

class IEmailService(ABC):
    @abstractmethod
    def send_contact_email(self, contacto: ContactoDto) -> None:
        pass
