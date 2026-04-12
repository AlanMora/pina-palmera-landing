import {
  Component,
  ChangeDetectionStrategy,
  afterNextRender,
  inject,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-calaverandia-teaser',
  imports: [RouterLink],
  templateUrl: './calaverandia-teaser.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalaverandiaTeaserComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => {
        this.initAnimations();
      });
    });
  }

  private initAnimations() {
    gsap.from('.cteaser-badge', {
      scrollTrigger: { trigger: '.cteaser-section', start: 'top 85%' },
      duration: 0.55, y: -20, opacity: 0, ease: 'back.out(2)',
    });

    gsap.from('.cteaser-card', {
      scrollTrigger: { trigger: '.cteaser-section', start: 'top 82%' },
      duration: 0.9, y: 60, opacity: 0, ease: 'power3.out', delay: 0.1,
    });

    gsap.from('.cteaser-title', {
      scrollTrigger: { trigger: '.cteaser-card', start: 'top 88%' },
      duration: 0.8, x: -30, opacity: 0, ease: 'power2.out', delay: 0.2,
    });

    gsap.from('.cteaser-desc', {
      scrollTrigger: { trigger: '.cteaser-card', start: 'top 86%' },
      duration: 0.7, y: 20, opacity: 0, ease: 'power2.out', delay: 0.35,
    });

    gsap.from('.cteaser-cta', {
      scrollTrigger: { trigger: '.cteaser-card', start: 'top 84%' },
      duration: 0.6, scale: 0.85, opacity: 0, ease: 'back.out(1.8)', delay: 0.5,
    });

    gsap.from('.cteaser-pill', {
      scrollTrigger: { trigger: '.cteaser-card', start: 'top 84%' },
      duration: 0.45, scale: 0.7, opacity: 0, ease: 'back.out(2)',
      stagger: 0.08, delay: 0.4,
    });

    // Pulso sutil en el badge de anuncio
    gsap.to('.cteaser-pulse', {
      scale: 1.08, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1,
    });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
  }
}
