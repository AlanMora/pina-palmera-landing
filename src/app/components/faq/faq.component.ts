import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

interface FaqItem {
  pregunta: string;
  respuesta: string;
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent {
  readonly openIndex = signal<number | null>(null);

  readonly faqs: FaqItem[] = [
    {
      pregunta: '¿Con cuánto tiempo de anticipación debo apartar mi fecha?',
      respuesta: 'Recomendamos apartar con al menos 5 días hábiles de anticipación. En temporadas altas (diciembre, primavera y verano) pedimos hasta 2 semanas para garantizar disponibilidad de sabores y logística.',
    },
    {
      pregunta: '¿Los vitroleros incluyen hielo, vasos y cucharón?',
      respuesta: 'Sí. Cada vitrolero viene con hielo suficiente para el evento y cucharón. También podemos incluir vasos de 550ml. Todo se entrega limpio y listo para servirse.',
    },
    {
      pregunta: '¿Puedo pedir diferentes sabores en un mismo pedido?',
      respuesta: '¡Claro! Cada vitrolero puede ser un sabor distinto. Tenemos más de 20 sabores disponibles en Clásicos, más opciones con piquete, Kids e Infusiones. Indícanos tus preferencias al apartar.',
    },
    {
      pregunta: '¿Cuál es la zona de cobertura para envío a domicilio?',
      respuesta: 'Hacemos envíos dentro del periférico de Guadalajara con un costo fijo de $250. Para zonas fuera del periférico o municipios conurbados (Zapopan, Tlaquepaque, Tonalá), contáctanos y lo cotizamos.',
    },
    {
      pregunta: '¿Aceptan tarjeta de crédito o débito?',
      respuesta: 'Por el momento el pago es por transferencia bancaria (SPEI) antes del evento. Los datos de cuenta los encuentras en la sección de pago. No manejamos efectivo ni terminal física.',
    },
    {
      pregunta: '¿Cuánto tiempo duran las aguas frescas?',
      respuesta: 'Nuestras aguas se preparan el mismo día del evento para garantizar frescura máxima. Una vez servidas en el vitrolero con hielo, se mantienen en óptimas condiciones por 6–8 horas.',
    },
    {
      pregunta: '¿Qué pasa si necesito cancelar o cambiar la fecha?',
      respuesta: 'Entendemos que los planes cambian. Puedes cambiar la fecha sin costo con al menos 72 horas de anticipación. Para cancelaciones, contáctanos y evaluamos caso por caso según el tiempo de aviso.',
    },
    {
      pregunta: '¿Los precios varían por sabor o temporada?',
      respuesta: 'Los precios son fijos por categoría, no por sabor específico. Lo que sí puede variar es la disponibilidad de ciertos sabores según la temporada de fruta. Siempre te confirmamos disponibilidad al apartar.',
    },
  ];

  toggle(index: number) {
    this.openIndex.set(this.openIndex() === index ? null : index);
  }
}
