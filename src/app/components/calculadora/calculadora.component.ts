import {
  Component,
  ChangeDetectionStrategy,
  inject,
  afterNextRender,
  OnDestroy,
  effect,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculadoraService, Categoria, Endulzante } from '../../services/calculadora.service';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-calculadora',
  imports: [FormsModule],
  templateUrl: './calculadora.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculadoraComponent implements OnDestroy {
  readonly calc = inject(CalculadoraService);
  private readonly platformId = inject(PLATFORM_ID);
  private animationsReady = false;

  readonly categorias: { id: Categoria; label: string; icon: string; precio: string }[] = [
    { id: 'clasicos',   label: 'Clásicos',    icon: '🥤', precio: '$750–$850' },
    { id: 'piquete',    label: 'Con piquete',  icon: '🌶️', precio: '$950–$1050' },
    { id: 'kids',       label: 'Kids',         icon: '⭐', precio: '$690' },
    { id: 'infusiones', label: 'Infusiones',   icon: '🌿', precio: '$380' },
  ];

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => {
        this.animationsReady = true;
        this.initAnimations();
      });
    });

    // Animación elástica al cambiar vitroleros
    effect(() => {
      this.calc.vitroleros();
      if (this.animationsReady) {
        gsap.fromTo('#vitroleros-num',
          { scale: 1.4, opacity: 0.5 },
          { duration: 0.5, scale: 1, opacity: 1, ease: 'elastic.out(1, 0.4)' }
        );
        // Flash en el precio total
        gsap.fromTo('#precio-total',
          { opacity: 0.4, scale: 1.08 },
          { duration: 0.4, opacity: 1, scale: 1, ease: 'power2.out' }
        );
      }
    });
  }

  private initAnimations() {
    // Encabezado — fade + subida
    gsap.from('.calc-header', {
      scrollTrigger: { trigger: '.calc-header', start: 'top 88%' },
      duration: 0.7, y: 30, opacity: 0, ease: 'power3.out',
    });

    // Widget completo — aparece desde abajo con spring
    gsap.from('.calc-widget', {
      scrollTrigger: { trigger: '.calc-widget', start: 'top 85%' },
      duration: 0.9, y: 50, opacity: 0, ease: 'back.out(1.2)',
    });

    // Columnas de controles — stagger sutil
    const cols = document.querySelectorAll('.calc-col');
    gsap.from(cols, {
      scrollTrigger: { trigger: '.calc-widget', start: 'top 80%' },
      duration: 0.5, y: 20, opacity: 0, ease: 'power2.out', stagger: 0.08,
    });

    // Banda de resultado — brillo de entrada
    gsap.fromTo('.calc-results',
      { boxShadow: '0 0 0px rgba(232,212,77,0)' },
      {
        scrollTrigger: { trigger: '.calc-widget', start: 'top 80%' },
        boxShadow: '0 4px 32px rgba(232,212,77,0.12)',
        duration: 1.2, ease: 'power2.out',
      }
    );
  }

  setCategoria(cat: Categoria) { this.calc.categoria.set(cat); }
  setEndulzante(end: Endulzante) { this.calc.endulzante.set(end); }
  adjustInvitados(delta: number) { this.calc.ajustarInvitados(delta); }

  onInvitadosChange(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.calc.setInvitados(val);
  }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
    }).format(n);
  }

  getCategoriaLabel(cat: Categoria): string {
    const labels: Record<Categoria, string> = {
      clasicos: 'Clásicos',
      piquete: 'Con piquete',
      kids: 'Kids',
      infusiones: 'Infusiones',
    };
    return labels[cat];
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      ScrollTrigger.getAll().forEach(t => t.kill());
      gsap.killTweensOf('*');
    }
  }
}
