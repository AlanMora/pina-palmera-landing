import { Component, ChangeDetectionStrategy, afterNextRender, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

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
    const cards = gsap.utils.toArray<HTMLElement>('.envio-card');

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
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      gsap.killTweensOf('.envio-card, .envio-icon');
    }
  }
}
