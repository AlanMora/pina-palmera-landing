import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { LucideCheck, LucideDroplets, LucideGlassWater, LucidePlus } from '@lucide/angular';
import { Catalog, CatalogCategory, CategoryId } from '../../../services/catalog';
import { Endulzante } from '../../../services/calculadora.service';

@Component({
  selector: 'app-menu-collection',
  imports: [LucideCheck, LucideDroplets, LucideGlassWater, LucidePlus],
  templateUrl: './menu-collection.component.html',
  styleUrl: './menu-collection.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuCollectionComponent {
  readonly catalog = inject(Catalog);
  readonly category = input.required<CatalogCategory>();
  readonly sweetener = input.required<Endulzante>();
  readonly disabled = input(false);
  readonly lastAdded = input('');
  readonly sweetenerChange = output<Endulzante>();
  readonly flavorAdd = output<string>();
  readonly price = computed(() =>
    this.sweetener() === 'splenda'
      ? (this.category().priceSplenda ?? NaN)
      : this.category().priceMorena,
  );
  readonly descriptions: Record<CategoryId, string> = {
    clasicos: 'Los de siempre, con un giro tropical.',
    piquete: 'Un brindis con mucho sabor. Solo para mayores de edad.',
    kids: 'Los sabores que acompañan sus grandes momentos.',
    infusiones: 'Una pausa cítrica y herbal para compartir.',
  };
}
