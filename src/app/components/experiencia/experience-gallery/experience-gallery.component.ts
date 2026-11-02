import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { LucideArrowLeft, LucideArrowRight, LucideExpand, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-experience-gallery',
  imports: [LucideArrowLeft, LucideArrowRight, LucideExpand, LucideX],
  templateUrl: './experience-gallery.component.html',
  styleUrls: ['../experience-shared.css', './experience-gallery.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceGalleryComponent {
  private readonly document = inject(DOCUMENT);
  private previousOverflow: string | null = null;
  readonly activePhoto = signal(0);
  readonly photos = [
    {
      id: 1,
      title: 'Un rincón para compartir',
      alt: 'Carrito Piña Palmera con vitroleros de infusión, horchata y limonada en un jardín',
      width: 1080,
      height: 1080,
    },
    {
      id: 2,
      title: 'Colores que invitan a brindar',
      alt: 'Cuatro vitroleros de distintos sabores sobre el carrito de madera Piña Palmera',
      width: 1199,
      height: 1199,
    },
    {
      id: 3,
      title: 'La mesa más fresca',
      alt: 'Aguas de colores rosa, verde y rojo presentadas con hojas decorativas',
      width: 1280,
      height: 1280,
    },
    {
      id: 4,
      title: 'Los detalles también cuentan',
      alt: 'Detalle de los vitroleros con etiquetas de horchata fresa, hierbabuena limón y mandarina fresa',
      width: 1166,
      height: 1177,
    },
    {
      id: 5,
      title: 'Cada montaje tiene su historia',
      alt: 'Carrito Piña Palmera con tres vitroleros de colores junto a un árbol decorativo',
      width: 1408,
      height: 1760,
    },
  ];
  readonly photo = computed(() => this.photos[this.activePhoto()]);
  readonly sizes = [
    {
      value: '300',
      unit: 'ml',
      title: 'Un pequeño antojo',
      label: 'Mini',
      height: 72,
      color: '#df9c9f',
      fruit: 'fresa',
    },
    {
      value: '550',
      unit: 'ml',
      title: 'Para brindar a gusto',
      label: 'Estándar',
      height: 98,
      color: '#b9ca82',
      fruit: 'limon',
    },
    {
      value: '1',
      unit: 'L',
      title: 'La frescura va contigo',
      label: 'Para llevar',
      height: 122,
      color: '#e4bc72',
      fruit: 'pina',
    },
  ];
  constructor() {
    inject(DestroyRef).onDestroy(() => this.restoreScroll());
  }
  openPhoto(index: number, dialog: HTMLDialogElement) {
    this.activePhoto.set(index);
    if (!dialog.open) {
      this.previousOverflow = this.document.body.style.overflow;
      this.document.body.style.overflow = 'hidden';
      dialog.showModal();
    }
  }
  movePhoto(direction: number) {
    this.activePhoto.update(
      (index) => (index + direction + this.photos.length) % this.photos.length,
    );
  }
  closeBackdrop(event: MouseEvent, dialog: HTMLDialogElement) {
    if (event.target === dialog) dialog.close();
  }
  restoreScroll() {
    if (this.previousOverflow !== null) {
      this.document.body.style.overflow = this.previousOverflow;
      this.previousOverflow = null;
    }
  }
}
