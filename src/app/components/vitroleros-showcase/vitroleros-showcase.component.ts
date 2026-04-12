import {
  Component,
  ChangeDetectionStrategy,
  inject,
  PLATFORM_ID,
  afterNextRender,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-vitroleros-showcase',
  imports: [],
  templateUrl: './vitroleros-showcase.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VitroleroShowcaseComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

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

    // Encabezado — fade + subida
    gsap.from('.vit-header', {
      scrollTrigger: { trigger: '.vit-section', start: 'top 85%' },
      duration: 0.8, y: 40, opacity: 0, ease: 'power3.out',
    });

    // Stats
    gsap.from('.vit-stat', {
      scrollTrigger: { trigger: '.vit-section', start: 'top 80%' },
      duration: 0.5, y: 20, opacity: 0, ease: 'power2.out',
      stagger: 0.08, delay: 0.2,
    });

    // Marquee fila 1 — izquierda infinito
    const track1 = document.querySelector('.vit-track-1') as HTMLElement;
    if (track1) {
      const totalWidth = track1.scrollWidth / 2; // mitad porque está duplicado
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
      const totalWidth = track2.scrollWidth / 2;
      gsap.fromTo(track2,
        { x: -totalWidth },
        { x: 0, duration: 32, ease: 'none', repeat: -1 }
      );
    }

    // Fade-in de las filas al hacer scroll
    gsap.from('.vit-row', {
      scrollTrigger: { trigger: '.vit-rows', start: 'top 88%' },
      duration: 0.9, opacity: 0, y: 30, ease: 'power2.out',
      stagger: 0.18,
    });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      ScrollTrigger.getAll().forEach(t => t.kill());
      gsap.killTweensOf('.vit-track-1, .vit-track-2');
    }
  }
}
