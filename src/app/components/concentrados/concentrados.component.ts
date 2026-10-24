import { Component, ChangeDetectionStrategy, afterNextRender, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

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
      gsap.killTweensOf('.concentrado-card');
    }
  }
}
