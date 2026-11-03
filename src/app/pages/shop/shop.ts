import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideShoppingBag,
  LucidePlus,
  LucideMinus,
  LucideArrowRight,
  LucideCheck,
  LucideLeaf,
} from '@lucide/angular';
import { CalculadoraService, Endulzante } from '../../services/calculadora.service';
import { CatalogCategory, CategoryId } from '../../services/catalog';
import { flavorArtwork } from '../../components/menu/menu-flavor-card/flavor-artwork';
import { OrderSummaryComponent } from './order-summary/order-summary.component';

@Component({
  selector: 'app-shop',
  imports: [
    RouterLink,
    FormsModule,
    LucideShoppingBag,
    LucidePlus,
    LucideMinus,
    LucideArrowRight,
    LucideCheck,
    LucideLeaf,
    OrderSummaryComponent,
  ],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shop {
  readonly cart = inject(CalculadoraService);
  readonly notice = signal('');
  readonly messages = signal<Partial<Record<CategoryId, { text: string; error: boolean }>>>({});
  readonly remaining = computed(() => Math.max(0, 50 - this.cart.lineas().length));
  flavors: Partial<Record<CategoryId, string>> = {};
  sweeteners: Partial<Record<CategoryId, Endulzante>> = {};
  quantities: Partial<Record<CategoryId, number | null>> = {};
  selectedFlavor(c: CatalogCategory) {
    return this.flavors[c.id] ?? c.flavors[0] ?? '';
  }
  selectedSweetener(c: CatalogCategory): Endulzante {
    return c.priceSplenda !== null && this.sweeteners[c.id] === 'splenda' ? 'splenda' : 'morena';
  }
  quantityValue(c: CatalogCategory) {
    return this.quantities[c.id] === undefined ? 1 : this.quantities[c.id];
  }
  artwork(c: CatalogCategory) {
    return flavorArtwork(this.selectedFlavor(c));
  }
  clearMessage(id: CategoryId) {
    this.messages.update((m) => ({ ...m, [id]: undefined }));
  }
  adjustQuantity(c: CatalogCategory, delta: number) {
    const value = this.quantityValue(c);
    const next =
      (typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : 1) + delta;
    this.quantities[c.id] = Math.max(1, Math.min(Math.max(1, this.remaining()), next));
    this.clearMessage(c.id);
  }
  canAdd(c: CatalogCategory) {
    return (
      c.available &&
      c.flavors.length > 0 &&
      !this.cart.catalog.loading() &&
      !this.cart.catalog.error() &&
      Number.isFinite(this.cart.catalog.price(c.id, this.selectedSweetener(c))) &&
      this.remaining() > 0
    );
  }
  add(c: CatalogCategory) {
    const quantity = this.quantityValue(c);
    let error = '';
    if (!this.canAdd(c)) error = 'Esta selección no está disponible en este momento.';
    else if (!c.flavors.includes(this.selectedFlavor(c)))
      error = 'Elige uno de los sabores disponibles.';
    else if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1)
      error = 'Escribe una cantidad entera de al menos 1 vitrolero.';
    else if (quantity > this.remaining())
      error = `Puedes agregar hasta ${this.remaining()} vitroleros más a este pedido.`;
    if (error) {
      this.messages.update((m) => ({ ...m, [c.id]: { text: error, error: true } }));
      return;
    }
    const before = this.cart.lineas().length;
    this.cart.addProduct(c.id, this.selectedFlavor(c), this.selectedSweetener(c), quantity!);
    const added = this.cart.lineas().length - before;
    if (added) {
      const text = `${added} ${added === 1 ? 'vitrolero agregado' : 'vitroleros agregados'}: ${this.selectedFlavor(c)}.`;
      this.notice.set(text);
      this.messages.update((m) => ({ ...m, [c.id]: { text, error: false } }));
    }
  }
}
