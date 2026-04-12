import { Component, ChangeDetectionStrategy, ElementRef, OnDestroy, afterNextRender, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CartSidebarService } from '../../services/cart-sidebar.service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly sidebar = inject(CartSidebarService);
  private readonly buttonCleanup: Array<() => void> = [];
  private gsapContext?: gsap.Context;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      requestAnimationFrame(() => {
        this.gsapContext = gsap.context(() => {
          this.spawnParticles();
          this.initAnimations();
        }, this.host.nativeElement);
      });
    });
  }

  private spawnParticles() {
    const container = this.host.nativeElement.querySelector('.hero-particles');
    if (!container) return;

    for (let i = 0; i < 22; i++) {
      const dot = document.createElement('div');
      const size = Math.random() * 6 + 3;
      const colors = [
        'rgba(232,212,77,',
        'rgba(76,175,110,',
        'rgba(125,201,106,',
        'rgba(244,168,58,',
        'rgba(75,209,191,',
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];

      dot.style.cssText = `
        position:absolute; width:${size}px; height:${size}px;
        border-radius:50%; background:${color}${(Math.random() * 0.35 + 0.08).toFixed(2)});
        left:${(Math.random() * 100).toFixed(1)}%; top:${(Math.random() * 100).toFixed(1)}%;
        pointer-events:none; will-change:transform,opacity;
      `;
      container.appendChild(dot);
      gsap.to(dot, {
        y: -(120 + Math.random() * 180),
        x: (Math.random() - 0.5) * 100,
        opacity: 0,
        duration: 3.5 + Math.random() * 4,
        delay: Math.random() * 5,
        repeat: -1,
        ease: 'power1.in',
        repeatDelay: Math.random() * 3,
      });
    }
  }

  private initAnimations() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const createHeroScrollTrigger = () => ({
      trigger: '#inicio',
      start: 'top top',
      end: 'bottom top',
      scrub: 2,
    });
    const photos = Array.from(this.host.nativeElement.querySelectorAll('.collage-photo')) as HTMLElement[];
    const ctaButtons = Array.from(this.host.nativeElement.querySelectorAll('.cta-btn')) as HTMLElement[];

    gsap.set('.hero-palm', { transformOrigin: 'bottom center' });
    gsap.set('.hero-leaf', { transformOrigin: 'center center' });
    gsap.set('.hero-breeze', { transformOrigin: 'center center' });

    // Secuencia de entrada del texto
    tl
      .from('.hero-sun', {
        duration: 1.4,
        scale: 0.5,
        opacity: 0,
      }, 0)
      .from('.hero-leaf', {
        duration: 1.8,
        x: (index) => (index % 2 === 0 ? -150 : 120),
        y: 60,
        opacity: 0,
        rotation: (index) => (index % 2 === 0 ? -20 : 18),
        ease: 'power2.out', stagger: 0.15,
      }, 0)
      .from('.hero-palm', {
        duration: 1.6,
        y: 90,
        opacity: 0,
        rotation: (index) => (index === 0 ? -12 : 12),
        ease: 'power2.out',
        stagger: 0.15,
      }, 0.05)
      .from('.hero-breeze', {
        duration: 1.2,
        x: 32,
        opacity: 0,
        stagger: 0.15,
      }, 0.12)
      .from('.hero-logo', {
        duration: 1.1, y: -60, opacity: 0, scale: 0.6, rotation: -10,
        ease: 'back.out(1.7)',
      }, 0.1)
      .from('.hero-title', { duration: 0.9, y: 50, opacity: 0 }, '-=0.5')
      .from('.hero-subtitle', { duration: 0.6, y: 30, opacity: 0 }, '-=0.5')
      .from('.hero-tagline', { duration: 0.8, y: 40, opacity: 0 }, '-=0.45')
      .from('.hero-badges > span', {
        duration: 0.5, y: 20, opacity: 0, scale: 0.85,
        ease: 'back.out(1.6)', stagger: 0.08,
      }, '-=0.4')
      .from('.hero-ctas .hero-cta', {
        duration: 0.6, scale: 0.45, opacity: 0,
        ease: 'back.out(2.2)', stagger: 0.12,
      }, '-=0.3');

    // Collage — cada foto entra escalonada con rotación
    gsap.from(photos, {
      duration: 0.9,
      scale: 0,
      opacity: 0,
      rotation: (i) => (i % 2 === 0 ? -18 : 18),
      ease: 'back.out(1.5)',
      stagger: 0.12,
      delay: 0.5,
    });

    // Badges del collage — pop-in con rebote
    gsap.from('.collage-badge', {
      duration: 0.7,
      scale: 0,
      opacity: 0,
      ease: 'back.out(2.5)',
      stagger: 0.1,
      delay: 1.2,
    });

    // Sol cálido pulsante
    gsap.to('.hero-sun', {
      scale: 1.08,
      opacity: 0.85,
      duration: 4.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Flotación continua del collage completo
    gsap.to('.hero-collage', {
      y: '-=12',
      duration: 3.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Flotación individual de fotos (distintos tiempos = efecto orgánico)
    photos.forEach((photo: HTMLElement, i: number) => {
      gsap.to(photo, {
        y: `${i % 2 === 0 ? -8 : 8}`,
        rotation: `+=${i % 2 === 0 ? 2 : -2}`,
        duration: 2.5 + i * 0.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.3,
      });
    });

    // Badges flotando suavemente
    gsap.to('.collage-badge', {
      y: '-=6',
      duration: 2.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: { each: 0.5, from: 'random' },
    });

    // Logo glow pulsante
    gsap.to('.hero-logo', {
      filter: 'drop-shadow(0 0 28px rgba(232,212,77,0.7))',
      duration: 2.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Hojas — flotación continua
    gsap.to('.hero-leaf', {
      y: '-=18',
      x: '+=10',
      rotation: '+=8',
      duration: 3.6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: { each: 0.55, from: 'random' },
    });

    // Palmas con vaivén suave
    gsap.to('.hero-palm', {
      y: '-=16',
      rotation: (index) => (index === 0 ? -5 : 5),
      duration: (index) => 4.8 + index * 0.7,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Brisa lateral
    gsap.to('.hero-breeze', {
      x: '+=18',
      opacity: 0.7,
      duration: 3.4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: 0.25,
    });

    // Parallax decorativo en scroll
    gsap.to('.hero-leaf', {
      scrollTrigger: createHeroScrollTrigger(),
      y: 150,
      x: (index) => (index % 2 === 0 ? 28 : -32),
      rotation: (index) => (index % 2 === 0 ? 16 : -14),
      ease: 'none',
    });

    gsap.to('.hero-palm', {
      scrollTrigger: createHeroScrollTrigger(),
      y: 110,
      x: (index) => (index === 0 ? -20 : 20),
      rotation: (index) => (index === 0 ? -8 : 8),
      ease: 'none',
    });

    gsap.to('.hero-sun', {
      scrollTrigger: createHeroScrollTrigger(),
      y: 90,
      scale: 1.15,
      opacity: 0.55,
      ease: 'none',
    });

    gsap.to('.hero-breeze', {
      scrollTrigger: createHeroScrollTrigger(),
      x: 48,
      opacity: 0.2,
      ease: 'none',
    });

    // Scroll indicator bounce
    gsap.to('.hero-scroll', {
      y: 10,
      opacity: 0.4,
      duration: 1.1,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Magnetic hover en botones CTA
    ctaButtons.forEach((btn: HTMLElement) => {
      const onEnter = () => gsap.to(btn, { duration: 0.3, scale: 1.07, ease: 'power2.out' });
      const onLeave = () => gsap.to(btn, { duration: 0.55, scale: 1, ease: 'elastic.out(1, 0.45)' });

      btn.addEventListener('mouseenter', onEnter);
      btn.addEventListener('mouseleave', onLeave);
      this.buttonCleanup.push(() => {
        btn.removeEventListener('mouseenter', onEnter);
        btn.removeEventListener('mouseleave', onLeave);
      });
    });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.buttonCleanup.forEach((cleanup) => cleanup());
      this.buttonCleanup.length = 0;
      this.gsapContext?.revert();
    }
  }
}
