import { Component, ChangeDetectionStrategy, afterNextRender, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-experiencia',
  templateUrl: './experiencia.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienciaComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  readonly includes = [
    { emoji: '🫙', texto: 'Vitrolero de vidrio templado de 20 litros' },
    { emoji: '🥄', texto: 'Cucharón dosificador incluido' },
    { emoji: '🧊', texto: 'Hielo suficiente para mantener la temperatura' },
    { emoji: '🥃', texto: 'Vasos de 1L para llevar (disponibles)' },
    { emoji: '🧃', texto: 'Presentación en vasos de 550ml estándar' },
    { emoji: '🍵', texto: 'Opción mini en vasos de 300ml' },
    { emoji: '🌿', texto: 'Decoración natural con frutas y hierbas frescas' },
    { emoji: '📋', texto: 'Etiqueta personalizada con tu nombre de evento' },
  ];

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => {
        this.initAnimations();
      });
    });
  }

  private initAnimations() {
    // Float continuo en stat cards (bobbing diferente para cada una)
    gsap.to('.stat-card:nth-child(1)', { y: -8, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.stat-card:nth-child(2)', { y: -10, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.5 });
    gsap.to('.stat-card:nth-child(3)', { y: -7, duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      gsap.killTweensOf('.stat-card');
    }
  }
}
