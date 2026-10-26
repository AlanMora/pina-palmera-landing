import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Catalog, CategoryId } from '../../services/catalog';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  readonly catalog = inject(Catalog);
  readonly tabActivo = signal<CategoryId>('clasicos');
  get categorias() {
    return this.catalog
      .categories()
      .map((c) => ({
        id: c.id,
        nombre: c.name,
        emoji: c.emoji,
        sabores: c.flavors,
        precios: [
          this.catalog.money(c.priceMorena) + ' base / azúcar morena',
          ...(c.priceSplenda === null ? [] : [this.catalog.money(c.priceSplenda) + ' splenda']),
        ],
      }));
  }
  get categoriaActiva() {
    return this.categorias.find((c) => c.id === this.tabActivo()) ?? this.categorias[0];
  }
  setTab(tab: CategoryId) {
    this.tabActivo.set(tab);
  }
}
