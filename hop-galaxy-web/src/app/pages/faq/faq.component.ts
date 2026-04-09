import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [],
  templateUrl: './faq.component.html',
  styles: ``
})
export class FaqComponent {
  openIndex: number | null = null;

  faqs = [
    {
      question: '¿Es necesario reservar con antelación?',
      answer: 'Para juego libre puedes venir directamente, aunque recomendamos reservar en fines de semana y festivos. Para cumpleaños, excursiones y fiestas privadas sí es obligatorio reservar con antelación.'
    },
    {
      question: '¿Se necesitan calcetines especiales?',
      answer: 'Sí, es obligatorio usar calcetines antideslizantes específicos de trampolín por seguridad. Los puedes comprar en recepción si no los traes.'
    },
    {
      question: '¿Hay límite de edad o peso?',
      answer: 'Los bebés menores de 2 años pueden acceder gratis acompañados de un adulto. No hay límite de peso, aunque algunas atracciones pueden tener restricciones específicas por seguridad.'
    },
    {
      question: '¿Puedo traer comida o bebida?',
      answer: 'No se permite traer comida o bebida del exterior. Contamos con zona de cafetería y vending para tu comodidad.'
    },
    {
      question: '¿Cómo organizo un cumpleaños?',
      answer: 'Contacta con nosotros por teléfono o email y te explicamos los packs disponibles. Necesitamos reservar la fecha con al menos una semana de antelación y confirmar el número de invitados.'
    },
    {
      question: '¿Qué pasa si llego tarde a mi reserva?',
      answer: 'Si llegas tarde, el tiempo no se recupera. Te recomendamos llegar 15 minutos antes para registrarte y prepararte.'
    },
    {
      question: '¿Hay parking disponible?',
      answer: 'En Boadilla puedes usar el parking del Centro Comercial El Palacio. En Barajas hay parking disponible en la zona de Calle Campezo.'
    }
  ];

  toggleFaq(index: number) {
    this.openIndex = this.openIndex === index ? null : index;
  }
}
