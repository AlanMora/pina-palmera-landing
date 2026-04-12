import { Component, ChangeDetectionStrategy, afterNextRender, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
    // Título con clip-path reveal
    gsap.from('.experiencia .section-title', {
      scrollTrigger: { trigger: '.experiencia .section-title', start: 'top 85%' },
      duration: 0.9, y: 55, opacity: 0, ease: 'power3.out',
    });

    // Stats cards — entrada escalonada + rebote
    gsap.from('.stat-card', {
      scrollTrigger: { trigger: '.stats-row', start: 'top 82%' },
      duration: 0.7, y: 60, opacity: 0, scale: 0.92,
      ease: 'back.out(1.5)', stagger: 0.15,
    });

    // Contador numérico con color inicial
    gsap.from('.stat-number', {
      scrollTrigger: { trigger: '.stats-row', start: 'top 80%' },
      duration: 1.6, textContent: 0, snap: { textContent: 1 },
      ease: 'power1.out', stagger: 0.3,
    });

    // Float continuo en stat cards (bobbing diferente para cada una)
    gsap.to('.stat-card:nth-child(1)', { y: -8, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.stat-card:nth-child(2)', { y: -10, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.5 });
    gsap.to('.stat-card:nth-child(3)', { y: -7, duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });

    // Include items — cascada
    gsap.from('.include-item', {
      scrollTrigger: { trigger: '.includes-grid', start: 'top 80%' },
      duration: 0.5, y: 35, opacity: 0, ease: 'power2.out', stagger: 0.07,
    });

    // Gallery de fotos placeholder — entrada
    gsap.from('.photo-slot', {
      scrollTrigger: { trigger: '.photos-gallery', start: 'top 82%' },
      duration: 0.65, scale: 0.88, opacity: 0, ease: 'back.out(1.5)', stagger: 0.12,
    });

    // Glass sizes — entrada desde abajo
    gsap.from('.glass-item', {
      scrollTrigger: { trigger: '.glasses-section', start: 'top 82%' },
      duration: 0.6, y: 40, opacity: 0, ease: 'power2.out', stagger: 0.18,
    });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
  }
}
