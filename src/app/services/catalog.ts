import { Injectable, inject, signal, computed, afterNextRender } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
export type CategoryId = 'clasicos' | 'piquete' | 'kids' | 'infusiones';
export interface CatalogCategory {
  id: CategoryId;
  name: string;
  emoji: string;
  priceMorena: number;
  priceSplenda: number | null;
  flavors: string[];
  available: boolean;
}
export interface CatalogSettings {
  shippingCents: number;
  cartCents: number;
  depositPercent: number;
  bankName: string;
  bankHolder: string;
  bankClabe: string;
}
export interface CatalogData {
  categories: CatalogCategory[];
  settings: CatalogSettings;
}
@Injectable({ providedIn: 'root' })
export class Catalog {
  private readonly http = inject(HttpClient);
  readonly data = signal<CatalogData | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly categories = computed(() => this.data()?.categories ?? []);
  readonly settings = computed(() => this.data()?.settings);
  constructor() {
    afterNextRender(() => this.load());
  }
  load() {
    this.loading.set(true);
    this.error.set('');
    this.http.get<CatalogData>(environment.apiUrl + '/catalog').subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: () => {
        this.data.set(null);
        this.error.set('No pudimos cargar los precios. Intenta de nuevo en un momento.');
        this.loading.set(false);
      },
    });
  }
  price(id: CategoryId, sweetener = 'morena') {
    const c = this.categories().find((c) => c.id === id);
    return (sweetener === 'splenda' ? c?.priceSplenda : c?.priceMorena) ?? NaN;
  }
  money(cents: number | undefined) {
    return cents === undefined || !Number.isFinite(cents)
      ? 'Por consultar'
      : new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          maximumFractionDigits: 2,
        }).format(cents / 100);
  }
  range(c: CatalogCategory) {
    return (
      this.money(c.priceMorena) +
      (c.priceSplenda !== null ? ' – ' + this.money(c.priceSplenda) : '')
    );
  }
}
