import { Component, ChangeDetectionStrategy, afterNextRender, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-nuestras-aguas',
  templateUrl: './nuestras-aguas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuestrasAguasComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => {
        this.initAnimations();
      });
    });
  }

  private initAnimations() {
    // Floating animation continua en el slot de imagen
    gsap.to('.aguas-img-slot', {
      y: -12,
      duration: 3.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Burbujas flotantes (repetición infinita)
    gsap.to('.vitrolero-bubble', {
      y: -80,
      opacity: 0,
      duration: 2.2,
      ease: 'power1.in',
      stagger: { each: 0.7, repeat: -1, from: 'start' },
      repeatDelay: 0.3,
    });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      gsap.killTweensOf('.aguas-img-slot, .vitrolero-bubble');
    }
  }
}
