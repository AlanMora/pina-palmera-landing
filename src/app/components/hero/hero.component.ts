import { Component, ChangeDetectionStrategy, ElementRef, OnDestroy, afterNextRender, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { CartSidebarService } from '../../services/cart-sidebar.service';

interface HeroStat {
  value: string;
  label: string;
  color: string;
}

@Component({
  selector: 'app-hero',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly sidebar = inject(CartSidebarService);
  private readonly listenerCleanup: Array<() => void> = [];
  private gsapContext?: gsap.Context;

  readonly stats: HeroStat[] = [
    { value: '20L',  label: 'por vitrolero', color: 'text-white' },
    { value: '35',   label: 'bebidas',       color: 'text-brand-yellow' },
    { value: '100%', label: 'natural',       color: 'text-brand-green-light' },
    { value: '2014', label: 'desde',         color: 'text-brand-orange' },
  ];

  readonly categorias = ['Clásicos', 'Con piquete', 'Kids', 'Infusiones'];

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      requestAnimationFrame(() => {
        this.gsapContext = gsap.context(() => {
          this.spawnParticles();
          this.initAnimations();
          this.initTilt();
        }, this.host.nativeElement);
      });
    });
  }

  private spawnParticles() {
    const container = this.host.nativeElement.querySelector('.hero-particles');
    if (!container) return;

    const colors = ['232,212,77', '125,201,106', '244,168,58', '75,209,191', '232,84,106'];

    for (let i = 0; i < 26; i++) {
      const dot = document.createElement('div');
      const size = Math.random() * 4 + 2;
      const rgb = colors[Math.floor(Math.random() * colors.length)];

      dot.style.cssText = `
        position:absolute; width:${size}px; height:${size}px; border-radius:50%;
        background:rgba(${rgb},${(Math.random() * 0.5 + 0.3).toFixed(2)});
        box-shadow:0 0 ${size * 4}px rgba(${rgb},0.8);
        left:${(Math.random() * 100).toFixed(1)}%; top:${(Math.random() * 100).toFixed(1)}%;
        pointer-events:none; will-change:transform,opacity;
      `;
      container.appendChild(dot);
      gsap.to(dot, {
        y: -(120 + Math.random() * 200),
        x: (Math.random() - 0.5) * 80,
        opacity: 0,
        duration: 4 + Math.random() * 5,
        delay: Math.random() * 5,
        repeat: -1,
        ease: 'power1.in',
        repeatDelay: Math.random() * 3,
      });
    }
  }

  private initAnimations() {
    // Flotación continua
    gsap.to('.hero-chip', {
      y: '-=10',
      duration: 2.6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: { each: 0.6, from: 'random' },
    });

    gsap.set('.hero-palm', { transformOrigin: 'bottom center' });
    gsap.to('.hero-palm', {
      rotation: (index) => (index === 0 ? -4 : 4),
      duration: (index) => 4.8 + index * 0.7,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    gsap.to('.hero-scroll-dot', {
      y: 12,
      opacity: 0,
      duration: 1.4,
      ease: 'power1.in',
      repeat: -1,
    });

    // Hover magnético en CTAs
    const ctaButtons = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.cta-btn'));
    ctaButtons.forEach((btn) => {
      const onEnter = () => gsap.to(btn, { duration: 0.3, scale: 1.05, ease: 'power2.out' });
      const onLeave = () => gsap.to(btn, { duration: 0.55, scale: 1, ease: 'elastic.out(1, 0.45)' });

      btn.addEventListener('mouseenter', onEnter);
      btn.addEventListener('mouseleave', onLeave);
      this.listenerCleanup.push(() => {
        btn.removeEventListener('mouseenter', onEnter);
        btn.removeEventListener('mouseleave', onLeave);
      });
    });
  }

  // Inclinación 3D de la tarjeta siguiendo el cursor
  private initTilt() {
    const visual = this.host.nativeElement.querySelector<HTMLElement>('.hero-visual');
    const card = this.host.nativeElement.querySelector<HTMLElement>('.hero-card');
    if (!visual || !card || !window.matchMedia('(pointer: fine)').matches) return;

    gsap.set(card, { transformPerspective: 1200 });
    const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      const rect = visual.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rotY(px * 14);
      rotX(-py * 14);
    };
    const onLeave = () => {
      rotX(0);
      rotY(0);
    };

    visual.addEventListener('pointermove', onMove);
    visual.addEventListener('pointerleave', onLeave);
    this.listenerCleanup.push(() => {
      visual.removeEventListener('pointermove', onMove);
      visual.removeEventListener('pointerleave', onLeave);
    });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.listenerCleanup.forEach((cleanup) => cleanup());
      this.listenerCleanup.length = 0;
      this.gsapContext?.revert();
    }
  }
}
