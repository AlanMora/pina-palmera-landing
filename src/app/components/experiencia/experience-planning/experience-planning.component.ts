import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideCalendarDays,
  LucideCheck,
  LucideChevronDown,
  LucideLeaf,
  LucideMinus,
  LucidePlus,
  LucideShoppingBag,
} from '@lucide/angular';
import { CalculadoraService } from '../../../services/calculadora.service';

@Component({
  selector: 'app-experience-planning',
  imports: [
    RouterLink,
    LucideArrowRight,
    LucideCalendarDays,
    LucideCheck,
    LucideChevronDown,
    LucideLeaf,
    LucideMinus,
    LucidePlus,
    LucideShoppingBag,
  ],
  templateUrl: './experience-planning.component.html',
  styleUrls: ['../experience-shared.css', './experience-planning.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperiencePlanningComponent {
  readonly cart = inject(CalculadoraService);
  readonly notice = signal('');
  readonly cartPrice = computed(() => this.cart.catalog.settings()?.cartCents);
  readonly canAddCart = computed(() => {
    const price = this.cartPrice();
    return (
      !this.cart.catalog.loading() &&
      !this.cart.catalog.error() &&
      price !== undefined &&
      Number.isFinite(price) &&
      price >= 0
    );
  });
  readonly steps = [
    {
      title: 'Elige lo que se te antoje',
      text: 'Descubre el menú y combina tus sabores favoritos.',
    },
    {
      title: 'Arma tu pedido',
      text: 'Ajusta los vitroleros y agrega el carrito si lo quieres para tu evento.',
    },
    {
      title: 'Dale fecha a la celebración',
      text: 'Al continuar, elige tu fecha y confirma disponibilidad, entrega y total.',
    },
  ];
  readonly faqs = [
    {
      question: '¿El carrito está incluido con las aguas?',
      answer:
        'El carrito para eventos es un servicio adicional al precio de los vitroleros. Puedes agregarlo o quitarlo de tu pedido; la disponibilidad de la fecha se confirma al continuar.',
    },
    {
      question: '¿Puedo combinar varios sabores?',
      answer:
        'Sí. Puedes elegir un sabor por vitrolero y combinar distintas mezclas en el mismo pedido. Cada vitrolero contiene 20 litros.',
    },
    {
      question: '¿Cómo recibo mi pedido?',
      answer:
        'Puedes recogerlo en Midtown Jalisco, Guadalajara, o solicitar envío. Coordinamos el horario al confirmar; el envío se calcula con tu código postal al continuar el pedido.',
    },
  ];
  toggleCart() {
    if (!this.cart.incluirCarrito() && !this.canAddCart()) return;
    this.cart.toggleExtra('carrito');
    this.notice.set(
      this.cart.incluirCarrito()
        ? 'Carrito de eventos agregado a tu pedido.'
        : 'Carrito de eventos quitado de tu pedido.',
    );
  }
}
