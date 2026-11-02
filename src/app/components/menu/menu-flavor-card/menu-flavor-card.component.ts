import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { LucideMinus, LucidePlus } from '@lucide/angular';
import { Catalog } from '../../../services/catalog';
import { Endulzante } from '../../../services/calculadora.service';
import { flavorArtwork } from './flavor-artwork';

@Component({
  selector: 'app-menu-flavor-card',
  imports: [LucideMinus, LucidePlus],
  templateUrl: './menu-flavor-card.component.html',
  styleUrl: './menu-flavor-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuFlavorCardComponent {
  readonly catalog = inject(Catalog);
  readonly flavor = input.required<string>();
  readonly categoryName = input.required<string>();
  readonly priceCents = input.required<number>();
  readonly sweetener = input.required<Endulzante>();
  readonly quantity = input(0);
  readonly addDisabled = input(false);
  readonly flavorAdd = output<void>();
  readonly flavorRemove = output<void>();
  readonly artwork = computed(() => flavorArtwork(this.flavor()));
  readonly variantLabel = computed(
    () => `${this.flavor()} con ${this.sweetener() === 'splenda' ? 'Splenda' : 'morena / base'}`,
  );
}
