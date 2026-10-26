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

  get categorias() { return this.calc.catalog.categories().map(c => ({id:c.id,label:c.name,icon:c.emoji,precio:this.calc.catalog.range(c)})); }

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => {
        this.animationsReady = true;
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

  setCategoria(cat: Categoria) { this.calc.categoria.set(cat); }
  setEndulzante(end: Endulzante) { this.calc.endulzante.set(end); }
  adjustInvitados(delta: number) { this.calc.ajustarInvitados(delta); }

  onInvitadosChange(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.calc.setInvitados(val);
  }

  formatPrice(n: number): string {
    if (!Number.isFinite(n)) return this.calc.catalog.loading() ? 'Cargando…' : 'Por consultar';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency', currency: 'MXN', maximumFractionDigits: 2,
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
      gsap.killTweensOf('#vitroleros-num, #precio-total');
    }
  }
}
