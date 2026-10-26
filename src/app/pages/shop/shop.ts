import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideShoppingBag,
  LucidePlus,
  LucideMinus,
  LucideTrash2,
  LucideArrowRight,
  LucideCheck,
} from '@lucide/angular';
import { CalculadoraService, Endulzante } from '../../services/calculadora.service';
import { CatalogCategory } from '../../services/catalog';
@Component({
  selector: 'app-shop',
  imports: [
    RouterLink,
    FormsModule,
    LucideShoppingBag,
    LucidePlus,
    LucideMinus,
    LucideTrash2,
    LucideArrowRight,
    LucideCheck,
  ],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shop {
  readonly cart = inject(CalculadoraService);
  readonly notice = signal('');
  flavors: Record<string, string> = {};
  sweeteners: Record<string, Endulzante> = {};
  quantities: Record<string, number> = {};
  add(c: CatalogCategory) {
    this.cart.addProduct(
      c.id,
      this.flavors[c.id] || c.flavors[0],
      this.sweeteners[c.id] || 'morena',
      this.quantities[c.id] || 1,
    );
    this.notice.set(c.name + ' agregado a tu carrito');
  }
  readonly photos: Record<string, string> = {
    clasicos: 'imagen_1.jpg',
    piquete: 'imagen_3.jpg',
    kids: 'imagen_4.jpg',
    infusiones: 'imagen_6.jpg',
  };
}
