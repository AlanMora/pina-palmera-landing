import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

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
      gsap.killTweensOf('.calav-lightbox-img');
      document.body.style.overflow = '';
    }
  }
}
