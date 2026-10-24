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
import { CartSidebarService } from '../../services/cart-sidebar.service';
import { CalculadoraService } from '../../services/calculadora.service';

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
    // Pulso sutil continuo en el badge
    gsap.to('.price-highlight', {
      y: -4, duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5,
    });

    // Auto-rotación de fotos cada 3.5 s
    this.autoTimer = setInterval(() => {
      this.activePhoto.set((this.activePhoto() + 1) % this.photos.length);
    }, 3500);
  }

  ngOnDestroy() {
    if (this.autoTimer) clearInterval(this.autoTimer);
    if (isPlatformBrowser(this.platformId)) {
      gsap.killTweensOf('.price-highlight');
    }
  }
}
