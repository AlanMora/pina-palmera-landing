import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideMinus,
  LucidePlus,
  LucideShoppingBag,
  LucideTrash2,
} from '@lucide/angular';
import { CalculadoraService, VitroleroLinea } from '../../../services/calculadora.service';
@Component({
  selector: 'app-order-summary',
  imports: [
    FormsModule,
    RouterLink,
    LucideArrowRight,
    LucideMinus,
    LucidePlus,
    LucideShoppingBag,
    LucideTrash2,
  ],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderSummaryComponent {
  readonly cart = inject(CalculadoraService);
  canAddLine(line: VitroleroLinea) {
    return (
      this.cart.lineas().length < 50 &&
      !this.cart.catalog.loading() &&
      !this.cart.catalog.error() &&
      this.categoryAvailable(line.categoria) &&
      Number.isFinite(this.cart.getPrecioLinea(line))
    );
  }
  categoryAvailable(id: string) {
    return !!this.cart.catalog.categories().find((category) => category.id === id)?.available;
  }
  extraAvailable() {
    const price = this.cart.catalog.settings()?.cartCents;
    return (
      !this.cart.catalog.loading() &&
      !this.cart.catalog.error() &&
      price !== undefined &&
      Number.isFinite(price) &&
      price >= 0
    );
  }
}
