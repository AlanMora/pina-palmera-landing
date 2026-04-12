import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnDestroy,
  effect,
  afterNextRender,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartSidebarService } from '../../services/cart-sidebar.service';
import { CalculadoraService, Categoria, Endulzante } from '../../services/calculadora.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-cart-sidebar',
  imports: [FormsModule],
  templateUrl: './cart-sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSidebarComponent implements OnDestroy {
  readonly sidebar = inject(CartSidebarService);
  readonly calc    = inject(CalculadoraService);
  private readonly router     = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private ready = false;

  readonly categorias: { id: Categoria; label: string; precio: string }[] = [
    { id: 'clasicos',   label: 'Clásicos',    precio: '$750–$850'  },
    { id: 'piquete',    label: 'Con piquete',  precio: '$950–$1050' },
    { id: 'kids',       label: 'Kids',         precio: '$690'       },
    { id: 'infusiones', label: 'Infusiones',   precio: '$380'       },
  ];

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => {
        this.ready = true;
        // Refuerza el estado inicial por si GSAP está en carrera con Tailwind
        gsap.set('.cart-panel', { x: '100%' });
      });
    });

    effect(() => {
      const open = this.sidebar.isOpen();
      if (!this.ready || !isPlatformBrowser(this.platformId)) return;
      if (open) {
        gsap.to('.cart-panel', { duration: 0.38, x: '0%', ease: 'power3.out' });
        document.body.style.overflow = 'hidden';
      } else {
        gsap.to('.cart-panel', { duration: 0.3, x: '100%', ease: 'power3.in' });
        document.body.style.overflow = '';
      }
    });
  }

  setCategoria(cat: Categoria) { this.calc.categoria.set(cat); }
  setEndulzante(end: Endulzante) { this.calc.endulzante.set(end); }
  adjustInvitados(delta: number) { this.calc.ajustarInvitados(delta); }
  toggleExtra(extra: 'envio' | 'carrito') { this.calc.toggleExtra(extra); }

  onInvitadosChange(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.calc.setInvitados(val);
  }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
    }).format(n);
  }

  getCatLabel(cat: Categoria): string {
    const m: Record<Categoria, string> = {
      clasicos:   'Clásicos',
      piquete:    'Con piquete',
      kids:       'Kids',
      infusiones: 'Infusiones',
    };
    return m[cat];
  }

  apartar() {
    this.sidebar.close();
    setTimeout(() => this.router.navigate(['/reservar']), 350);
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
      gsap.killTweensOf('.cart-panel');
    }
  }
}
