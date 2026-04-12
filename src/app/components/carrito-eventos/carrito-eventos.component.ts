import {
  Component,
  ChangeDetectionStrategy,
  afterNextRender,
  OnDestroy,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CartSidebarService } from '../../services/cart-sidebar.service';
import { CalculadoraService } from '../../services/calculadora.service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-carrito-eventos',
  imports: [],
  templateUrl: './carrito-eventos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarritoEventosComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sidebar = inject(CartSidebarService);
  private readonly calc = inject(CalculadoraService);
  private autoTimer: ReturnType<typeof setInterval> | null = null;

  readonly activePhoto = signal(0);
  readonly photos = [
    { src: '/assets/images/carrito_1.jpg', alt: 'Carrito Piña Palmera en evento 1' },
    { src: '/assets/images/carrito_2.jpg', alt: 'Carrito Piña Palmera en evento 2' },
    { src: '/assets/images/carrito_3.jpg', alt: 'Carrito Piña Palmera en evento 3' },
    { src: '/assets/images/carrito_4.jpg', alt: 'Carrito Piña Palmera en evento 4' },
    { src: '/assets/images/carrito_5.jpg', alt: 'Carrito Piña Palmera en evento 5' },
  ];

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => {
        this.initAnimations();
      });
    });
  }



  addCarrito() {
    this.calc.aplicarServicio('carrito');
    this.sidebar.open();
  }

  private initAnimations() {
    // Eyebrow badge
    gsap.from('.carrito-eyebrow', {
      scrollTrigger: { trigger: '#carrito-eventos', start: 'top 85%' },
      duration: 0.6, y: -20, opacity: 0, ease: 'back.out(2)',
    });

    // Card completa — sube desde abajo
    gsap.from('.carrito-card', {
      scrollTrigger: { trigger: '.carrito-card', start: 'top 88%' },
      duration: 1, y: 70, opacity: 0, ease: 'power3.out',
    });

    // Columna foto — desde izquierda
    gsap.from('.carrito-gallery', {
      scrollTrigger: { trigger: '.carrito-card', start: 'top 82%' },
      duration: 0.9, x: -40, opacity: 0, ease: 'power2.out', delay: 0.15,
    });

    // Contenido derecho — desde derecha
    gsap.from('.carrito-card > div:last-child', {
      scrollTrigger: { trigger: '.carrito-card', start: 'top 82%' },
      duration: 0.9, x: 40, opacity: 0, ease: 'power2.out', delay: 0.15,
    });

    // Badge precio — pop con rebote
    gsap.from('.price-highlight', {
      scrollTrigger: { trigger: '.carrito-card', start: 'top 80%' },
      duration: 0.7, scale: 0, rotation: -12, opacity: 0, ease: 'back.out(2.2)', delay: 0.5,
    });

    // Pulso sutil continuo en el badge
    gsap.to('.price-highlight', {
      y: -4, duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5,
    });

    // Features — cascada
    gsap.from('.check-item', {
      scrollTrigger: { trigger: '.carrito-card', start: 'top 78%' },
      duration: 0.45, x: 25, opacity: 0, ease: 'power2.out', stagger: 0.1, delay: 0.35,
    });

    // Miniaturas — pop
    gsap.from('.carrito-thumb', {
      scrollTrigger: { trigger: '.carrito-card', start: 'top 78%' },
      duration: 0.4, scale: 0.6, opacity: 0, ease: 'back.out(1.8)', stagger: 0.07, delay: 0.4,
    });

    // Auto-rotación de fotos cada 3.5 s
    this.autoTimer = setInterval(() => {
      this.activePhoto.set((this.activePhoto() + 1) % this.photos.length);
    }, 3500);
  }

  ngOnDestroy() {
    if (this.autoTimer) clearInterval(this.autoTimer);
    if (isPlatformBrowser(this.platformId)) {
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
  }
}
