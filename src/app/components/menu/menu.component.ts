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
  readonly notice = signal('');
  readonly lastAdded = signal('');
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
      this.lastAdded.set(`${category.id}:${flavor}`);
      this.notice.set(
        `Agregaste ${flavor}. Tu pedido lleva ${count + 1} ${count === 0 ? 'vitrolero' : 'vitroleros'}.`,
      );
    }
  }

  private normalize(value: string) {
    return value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
  }
}
