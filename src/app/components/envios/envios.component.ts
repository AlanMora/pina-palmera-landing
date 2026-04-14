import { Component, ChangeDetectionStrategy, afterNextRender, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-envios',
  templateUrl: './envios.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnviosComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => {
        this.initAnimations();
      });
    });
  }

  private initAnimations() {
    gsap.from('.envios .section-title', {
      scrollTrigger: { trigger: '.envios .section-title', start: 'top 85%' },
      duration: 0.9, y: 55, opacity: 0, ease: 'power3.out',
    });

    // Usar fromTo para que las cards SIEMPRE terminen visibles
    const cards = gsap.utils.toArray<HTMLElement>('.envio-card');
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { y: 55, autoAlpha: 0 },
        {
          scrollTrigger: {
            trigger: '.envios-grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          duration: 0.75,
          y: 0,
          autoAlpha: 1,
          ease: 'back.out(1.3)',
          delay: i * 0.2,
        }
      );
    });

    // Float continuo en los iconos
    gsap.to('.envio-icon', {
      y: -8,
      duration: 2.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: 0.6,
    });

    // Hover tilt 3D en cards
    cards.forEach(card => {
      card.addEventListener('mouseenter', () =>
        gsap.to(card, { duration: 0.35, rotateY: 4, rotateX: -3, scale: 1.02, ease: 'power2.out',
          transformPerspective: 800 })
      );
      card.addEventListener('mouseleave', () =>
        gsap.to(card, { duration: 0.5, rotateY: 0, rotateX: 0, scale: 1, ease: 'elastic.out(1, 0.5)',
          transformPerspective: 800 })
      );
    });

    // Fallback: asegurar que las cards sean visibles después de 2s
    setTimeout(() => {
      cards.forEach(card => {
        gsap.set(card, { autoAlpha: 1, y: 0 });
      });
    }, 2000);
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
  }
}
