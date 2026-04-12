import { Component, ChangeDetectionStrategy, afterNextRender, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-concentrados',
  templateUrl: './concentrados.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConcentradosComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => {
        this.initAnimations();
      });
    });
  }

  private initAnimations() {
    gsap.from('.concentrados .section-title', {
      scrollTrigger: { trigger: '.concentrados .section-title', start: 'top 85%' },
      duration: 0.9, y: 55, opacity: 0, ease: 'power3.out',
    });

    // Jars image placeholders — entrada escalonada
    gsap.from('.jar-slot', {
      scrollTrigger: { trigger: '.jars-strip', start: 'top 82%' },
      duration: 0.6, y: 40, opacity: 0, scale: 0.88, ease: 'back.out(1.6)', stagger: 0.14,
    });

    // Cards de características
    gsap.from('.concentrado-card', {
      scrollTrigger: { trigger: '.concentrados-grid', start: 'top 80%' },
      duration: 0.65, y: 45, opacity: 0, ease: 'power2.out', stagger: 0.15,
    });

    // Hover float en cards (GSAP mouseenter/leave)
    document.querySelectorAll('.concentrado-card').forEach(card => {
      card.addEventListener('mouseenter', () =>
        gsap.to(card, { duration: 0.35, y: -8, scale: 1.02, ease: 'power2.out' })
      );
      card.addEventListener('mouseleave', () =>
        gsap.to(card, { duration: 0.45, y: 0, scale: 1, ease: 'elastic.out(1, 0.5)' })
      );
    });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
  }
}
