import { Component, ChangeDetectionStrategy, afterNextRender, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
    // Timeline coordinado de entrada
    const tl = gsap.timeline({
      scrollTrigger: { trigger: '.nuestras-aguas', start: 'top 78%' },
    });
    tl.from('.nuestras-aguas .section-title', { duration: 0.8, y: 55, opacity: 0, ease: 'power3.out' })
      .from('.nuestras-aguas .underline-bar', { duration: 0.5, scaleX: 0, transformOrigin: 'left', ease: 'power2.out' }, '-=0.3')
      .from('.aguas-img-slot', { duration: 1, x: -70, opacity: 0, ease: 'power2.out' }, '-=0.2')
      .from('.aguas-text > *', { duration: 0.6, y: 30, opacity: 0, ease: 'power2.out', stagger: 0.1 }, '-=0.6')
      .from('.badge', { duration: 0.45, scale: 0, opacity: 0, ease: 'back.out(2.5)', stagger: 0.1 }, '-=0.3')
      .from('.aguas-cta', { duration: 0.5, y: 20, opacity: 0, ease: 'power2.out' }, '-=0.1');

    // Floating animation continua en el slot de imagen
    gsap.to('.aguas-img-slot', {
      y: -12,
      duration: 3.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Liquid fill animation
    gsap.from('.vitrolero-liquid', {
      scrollTrigger: { trigger: '.aguas-img-slot', start: 'top 80%' },
      duration: 1.8,
      height: '0%',
      ease: 'power2.out',
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

    // Parallax en decoradores
    gsap.to('.aguas-dot-big', {
      scrollTrigger: { trigger: '.nuestras-aguas', start: 'top bottom', end: 'bottom top', scrub: 1.2 },
      y: -60, rotation: 25,
    });
    gsap.to('.aguas-dot-small', {
      scrollTrigger: { trigger: '.nuestras-aguas', start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      y: 40,
    });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
  }
}
