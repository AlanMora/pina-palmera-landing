import {
  Component,
  ChangeDetectionStrategy,
  inject,
  PLATFORM_ID,
  afterNextRender,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { gsap } from 'gsap';

import { CartSidebarService } from '../../services/cart-sidebar.service';

@Component({
  selector: 'app-vitroleros-showcase',
  imports: [NgOptimizedImage],
  templateUrl: './vitroleros-showcase.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VitroleroShowcaseComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  readonly sidebar = inject(CartSidebarService);

  // Copias de cada fila para que el marquee nunca muestre huecos
  readonly copias = [0, 1, 2];

  readonly stats = [
    { value: '20L',  label: 'por vitrolero',  color: 'text-white' },
    { value: '35',   label: 'bebidas aprox.', color: 'text-brand-yellow' },
    { value: '100%', label: 'natural',        color: 'text-brand-green-light' },
    { value: '2014', label: 'desde',          color: 'text-brand-orange' },
  ];

  // Fila 1 — se mueve a la izquierda (duplicada para loop infinito)
  readonly row1 = [
    { src: '/assets/images/portada.jpg',  alt: 'Vitrolero Piña Palmera — portada' },
    { src: '/assets/images/imagen_1.jpg', alt: 'Vitrolero Piña Palmera 1' },
    { src: '/assets/images/imagen_2.jpg', alt: 'Vitrolero Piña Palmera 2' },
    { src: '/assets/images/imagen_3.jpg', alt: 'Vitrolero Piña Palmera 3' },
    { src: '/assets/images/imagen_4.jpg', alt: 'Vitrolero Piña Palmera 4' },
  ];

  // Fila 2 — se mueve a la derecha
  readonly row2 = [
    { src: '/assets/images/imagen_5.jpg', alt: 'Vitrolero Piña Palmera 5' },
    { src: '/assets/images/imagen_6.jpg', alt: 'Vitrolero Piña Palmera 6' },
    { src: '/assets/images/imagen_7.jpg', alt: 'Vitrolero Piña Palmera 7' },
    { src: '/assets/images/portada.jpg',  alt: 'Vitrolero Piña Palmera — portada' },
    { src: '/assets/images/imagen_1.jpg', alt: 'Vitrolero Piña Palmera 1' },
  ];

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => {
        this.initAnimations();
      });
    });
  }

  private initAnimations() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Marquee fila 1 — izquierda infinito
    const track1 = document.querySelector('.vit-track-1') as HTMLElement;
    if (track1) {
      const totalWidth = (track1.scrollWidth + 16) / 3; // un tercio: hay 3 copias (16 = gap-4)
      gsap.to(track1, {
        x: -totalWidth,
        duration: 28,
        ease: 'none',
        repeat: -1,
      });
    }

    // Marquee fila 2 — derecha infinito (empieza desplazado a la izquierda)
    const track2 = document.querySelector('.vit-track-2') as HTMLElement;
    if (track2) {
      const totalWidth = (track2.scrollWidth + 16) / 3;
      gsap.fromTo(track2,
        { x: -totalWidth },
        { x: 0, duration: 32, ease: 'none', repeat: -1 }
      );
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      gsap.killTweensOf('.vit-track-1, .vit-track-2');
    }
  }
}
