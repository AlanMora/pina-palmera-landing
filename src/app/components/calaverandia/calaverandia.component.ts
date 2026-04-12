import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  PLATFORM_ID,
  afterNextRender,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-calaverandia',
  imports: [],
  templateUrl: './calaverandia.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalaverandiaComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  readonly lightboxOpen  = signal(false);
  readonly lightboxIndex = signal(0);

  // Fotos del evento Día de Muertos
  readonly eventPhotos = [
    { src: '/assets/images/dia_muertos_portada.jpg', alt: 'Calaverandia — portada del evento' },
    { src: '/assets/images/dia_muertos_1.jpg',   alt: 'Calaverandia — ambiente del evento 1' },
    { src: '/assets/images/dia_muertos_2.jpg',   alt: 'Calaverandia — ambiente del evento 2' },
    { src: '/assets/images/dia_muertos_3.jpg',   alt: 'Calaverandia — ambiente del evento 3' },
    { src: '/assets/images/dia_muertos_4.jpg',   alt: 'Calaverandia — ambiente del evento 4' },
    { src: '/assets/images/dia_muertos_5.jpg',   alt: 'Calaverandia — ambiente del evento 5' },
    { src: '/assets/images/dia_muertos_6.jpg',   alt: 'Calaverandia — ambiente del evento 6' },
    { src: '/assets/images/dia_muertos_7.jpg',   alt: 'Calaverandia — ambiente del evento 7' },
    { src: '/assets/images/dia_muertos_8.jpg',   alt: 'Calaverandia — ambiente del evento 8' },
    { src: '/assets/images/dia_muertos_9.jpg',   alt: 'Calaverandia — ambiente del evento 9' },
  ];

  // Fotos de vitroleros
  readonly vitroleroPhotos = [
    { src: '/assets/images/portada.jpg',   alt: 'Vitroleros Piña Palmera — portada' },
    { src: '/assets/images/imagen_1.jpg',  alt: 'Vitrolero Piña Palmera 1' },
    { src: '/assets/images/imagen_2.jpg',  alt: 'Vitrolero Piña Palmera 2' },
    { src: '/assets/images/imagen_3.jpg',  alt: 'Vitrolero Piña Palmera 3' },
    { src: '/assets/images/imagen_4.jpg',  alt: 'Vitrolero Piña Palmera 4' },
    { src: '/assets/images/imagen_5.jpg',  alt: 'Vitrolero Piña Palmera 5' },
    { src: '/assets/images/imagen_6.jpg',  alt: 'Vitrolero Piña Palmera 6' },
    { src: '/assets/images/imagen_7.jpg',  alt: 'Vitrolero Piña Palmera 7' },
  ];

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => {
        this.initAnimations();
      });
    });
  }

  private initAnimations() {
    // Badge "evento" — rebota desde arriba
    gsap.from('.calav-badge', {
      scrollTrigger: { trigger: '.calav-section', start: 'top 82%' },
      duration: 0.6, y: -30, opacity: 0, ease: 'back.out(2)',
    });

    // Título principal
    gsap.from('.calav-title', {
      scrollTrigger: { trigger: '.calav-title', start: 'top 88%' },
      duration: 0.9, y: 60, opacity: 0, ease: 'power3.out',
    });

    // Descripción
    gsap.from('.calav-desc', {
      scrollTrigger: { trigger: '.calav-desc', start: 'top 90%' },
      duration: 0.7, y: 30, opacity: 0, ease: 'power2.out', delay: 0.15,
    });

    // Imagen portada — parallax sutil
    gsap.to('.calav-hero-img', {
      scrollTrigger: {
        trigger: '.calav-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
      y: -50,
      ease: 'none',
    });

    // Grid fotos evento — stagger reveal
    gsap.from('.calav-event-photo', {
      scrollTrigger: { trigger: '.calav-event-grid', start: 'top 85%' },
      duration: 0.65, scale: 0.88, opacity: 0, ease: 'power2.out',
      stagger: { amount: 0.6, grid: 'auto', from: 'start' },
    });

    // Grid vitroleros — slide desde abajo con stagger
    gsap.from('.calav-vitrolero-photo', {
      scrollTrigger: { trigger: '.calav-vitrolero-grid', start: 'top 85%' },
      duration: 0.7, y: 50, opacity: 0, ease: 'back.out(1.2)',
      stagger: { amount: 0.5 },
    });

    // Stats — contador visual
    gsap.from('.calav-stat', {
      scrollTrigger: { trigger: '.calav-stats', start: 'top 88%' },
      duration: 0.5, y: 20, opacity: 0, ease: 'power2.out',
      stagger: 0.1,
    });

    // CTA button
    gsap.from('.calav-cta', {
      scrollTrigger: { trigger: '.calav-cta', start: 'top 92%' },
      duration: 0.7, scale: 0.85, opacity: 0, ease: 'back.out(1.8)',
    });
  }

  openLightbox(index: number) {
    this.lightboxIndex.set(index);
    this.lightboxOpen.set(true);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
      gsap.from('.calav-lightbox-img', {
        duration: 0.35, scale: 0.88, opacity: 0, ease: 'back.out(1.4)',
      });
    }
  }

  closeLightbox() {
    this.lightboxOpen.set(false);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  prevPhoto() {
    const all = [...this.eventPhotos, ...this.vitroleroPhotos];
    const prev = (this.lightboxIndex() - 1 + all.length) % all.length;
    this.lightboxIndex.set(prev);
    this.animateLightboxChange();
  }

  nextPhoto() {
    const all = [...this.eventPhotos, ...this.vitroleroPhotos];
    const next = (this.lightboxIndex() + 1) % all.length;
    this.lightboxIndex.set(next);
    this.animateLightboxChange();
  }

  private animateLightboxChange() {
    if (isPlatformBrowser(this.platformId)) {
      gsap.fromTo('.calav-lightbox-img',
        { opacity: 0.3, x: 20 },
        { duration: 0.28, opacity: 1, x: 0, ease: 'power2.out' }
      );
    }
  }

  get allPhotos() {
    return [...this.eventPhotos, ...this.vitroleroPhotos];
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      ScrollTrigger.getAll().forEach(t => t.kill());
      gsap.killTweensOf('*');
      document.body.style.overflow = '';
    }
  }
}
