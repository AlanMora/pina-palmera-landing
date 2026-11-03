import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowDown,
  LucideArrowRight,
  LucideChevronDown,
  LucideDroplets,
  LucideGlassWater,
  LucideLeaf,
  LucidePhone,
} from '@lucide/angular';
@Component({
  selector: 'app-concentrados',
  imports: [
    RouterLink,
    LucideArrowDown,
    LucideArrowRight,
    LucideChevronDown,
    LucideDroplets,
    LucideGlassWater,
    LucideLeaf,
    LucidePhone,
  ],
  templateUrl: './concentrados.component.html',
  styleUrls: ['../catalog-story.css', './concentrados.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConcentradosComponent {
  readonly benefits = [
    {
      title: 'Tu momento, tu mezcla',
      text: 'Prepara la bebida cuando la quieras disfrutar y dale tu toque al servir.',
      art: 'limon',
    },
    {
      title: 'Fácil de preparar',
      text: 'Sigue la proporción indicada para tu presentación, mezcla y sirve fría.',
      art: 'fresa',
    },
    {
      title: 'Para seguir compartiendo',
      text: 'Consulta los sabores y presentaciones disponibles para tus planes en casa.',
      art: 'pina',
    },
  ];
  readonly steps = [
    {
      title: 'Elige tu presentación',
      text: 'Confirma el sabor, el contenido y el precio por unidad antes de comprar.',
    },
    {
      title: 'Mezcla con agua fría',
      text: 'Usa la cantidad de agua indicada para la presentación que elegiste.',
    },
    {
      title: 'Sirve a tu gusto',
      text: 'Agrega hielo y disfruta. Confirma las indicaciones de conservación de tu producto.',
    },
  ];
  readonly faqs = [
    {
      question: '¿Qué sabores y presentaciones hay?',
      answer:
        'La variedad puede cambiar. Contáctanos para confirmar qué concentrados están disponibles y el precio por unidad de cada presentación.',
    },
    {
      question: '¿Cuántos litros rinde cada uno?',
      answer:
        'El rendimiento depende de la presentación y de su indicación de preparación. Confirma estos datos al consultar tu concentrado.',
    },
    {
      question: '¿Puedo pedirlos desde la tienda?',
      answer:
        'Por ahora, confirma tu pedido de concentrados directamente con nosotros. La tienda en línea está preparada para los vitroleros de 20 litros y los servicios para eventos.',
    },
  ];
}
