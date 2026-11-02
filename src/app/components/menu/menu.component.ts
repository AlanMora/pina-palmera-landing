import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideCheck,
  LucideDroplets,
  LucideGlassWater,
  LucideLeaf,
  LucideSearch,
  LucideShoppingBag,
  LucideX,
} from '@lucide/angular';
import { Catalog, CatalogCategory, CategoryId } from '../../services/catalog';
import { MenuHeroComponent } from './menu-hero/menu-hero.component';
import { MenuCollectionComponent } from './menu-collection/menu-collection.component';
import { CalculadoraService, Endulzante } from '../../services/calculadora.service';

@Component({
  selector: 'app-menu',
  host: { '(document:click)': 'onDocumentClick($event)' },
  imports: [
    RouterLink,
    MenuHeroComponent,
    MenuCollectionComponent,
    LucideArrowRight,
    LucideCheck,
    LucideDroplets,
    LucideGlassWater,
    LucideLeaf,
    LucideSearch,
    LucideShoppingBag,
    LucideX,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  readonly catalog = inject(Catalog);
  readonly cart = inject(CalculadoraService);
  readonly selectedCategory = signal<CategoryId | 'todos'>('clasicos');
  readonly query = signal('');
  readonly searchActive = signal(false);
  readonly notice = signal('');
  readonly quantityByVariant = computed(() =>
    Object.fromEntries(this.cart.grouped().map((group) => [group.key, group.quantity])),
  );
  private readonly sweeteners = signal<Partial<Record<CategoryId, Endulzante>>>({});

  readonly flavorCount = computed(() =>
    this.catalog.categories().reduce((count, category) => count + category.flavors.length, 0),
  );
  // A removed category must not leave the initial view empty after an admin update.
  readonly activeCategory = computed(() => {
    const selected = this.selectedCategory();
    return selected === 'todos' || this.catalog.categories().some((c) => c.id === selected)
      ? selected
      : (this.catalog.categories()[0]?.id ?? 'todos');
  });
  readonly results = computed(() => {
    const query = this.normalize(this.query().trim());
    return this.catalog
      .categories()
      .filter(
        (category) => this.activeCategory() === 'todos' || category.id === this.activeCategory(),
      )
      .map((category) => ({
        ...category,
        flavors: category.flavors.filter((flavor) =>
          this.normalize(`${category.name} ${flavor}`).includes(query),
        ),
      }))
      .filter((category) => category.flavors.length > 0);
  });
  readonly resultCount = computed(() =>
    this.results().reduce((count, category) => count + category.flavors.length, 0),
  );

  onDocumentClick(event: MouseEvent) {
    if (!(event.target as Element | null)?.closest('.search-field')) {
      this.searchActive.set(false);
    }
  }

  onSearchFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as Node | null;
    // On touch Safari, focus can leave the input before the clear button click.
    // Keep the bar hidden until that click finishes; keyboard Tab can update now.
    if (next && !(event.currentTarget as HTMLElement).contains(next)) {
      this.searchActive.set(false);
    }
  }

  selectCategory(category: CategoryId | 'todos') {
    this.selectedCategory.set(category);
    this.query.set('');
  }

  search(value: string) {
    this.query.set(value);
    if (value.trim()) this.selectedCategory.set('todos');
  }

  sweetener(category: CatalogCategory): Endulzante {
    return category.priceSplenda !== null && this.sweeteners()[category.id] === 'splenda'
      ? 'splenda'
      : 'morena';
  }

  selectSweetener(category: CategoryId, sweetener: Endulzante) {
    this.sweeteners.update((current) => ({ ...current, [category]: sweetener }));
  }

  price(category: CatalogCategory) {
    return this.sweetener(category) === 'splenda' ? category.priceSplenda! : category.priceMorena;
  }

  canOrder(category: CatalogCategory) {
    return (
      category.available && Number.isFinite(this.price(category)) && this.cart.lineas().length < 50
    );
  }

  addFlavor(category: CatalogCategory, flavor: string) {
    if (!this.canOrder(category)) return;
    const count = this.cart.lineas().length;
    this.cart.addProduct(category.id, flavor, this.sweetener(category));
    if (this.cart.lineas().length > count) {
      this.notice.set(
        `Agregaste ${flavor}. Tu pedido lleva ${count + 1} ${count === 0 ? 'vitrolero' : 'vitroleros'}.`,
      );
    }
  }

  removeFlavor(category: CatalogCategory, flavor: string) {
    const line = this.cart
      .lineas()
      .slice()
      .reverse()
      .find(
        (line) =>
          line.categoria === category.id &&
          line.sabor === flavor &&
          line.endulzante === this.sweetener(category),
      );
    if (!line) return;
    this.cart.eliminarLinea(line.id);
    const count = this.cart.lineas().length;
    this.notice.set(
      count
        ? `Quitaste un vitrolero de ${flavor}. Tu pedido lleva ${count} ${count === 1 ? 'vitrolero' : 'vitroleros'}.`
        : `Quitaste el último vitrolero de ${flavor}. Tu pedido está vacío.`,
    );
  }

  private normalize(value: string) {
    return value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
  }
}
