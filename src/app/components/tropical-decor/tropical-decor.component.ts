import {
  Component,
  ChangeDetectionStrategy,
  afterNextRender,
  OnDestroy,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-tropical-decor',
  imports: [],
  templateUrl: './tropical-decor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TropicalDecorComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => {
        this.initFloating();
        this.initParallax();
      });
    });
  }

  private initFloating() {
    // Cada hoja flota con parámetros únicos para que no sincronicen
    const leaves = document.querySelectorAll('.tdeco-leaf');
    leaves.forEach((el, i) => {
      const dur   = 3.5 + (i % 5) * 0.7;
      const yAmt  = 12 + (i % 4) * 5;
      const rotAmt = 4 + (i % 3) * 2;

      gsap.to(el, {
        y:        `-=${yAmt}`,
        rotation: `+=${rotAmt}`,
        duration: dur,
        ease:     'sine.inOut',
        yoyo:     true,
        repeat:   -1,
        delay:    i * 0.28,
      });
    });

    // Palmeras — oscilan como si hubiera brisa
    const palms = document.querySelectorAll('.tdeco-palm');
    palms.forEach((el, i) => {
      gsap.to(el, {
        rotation:      `+=${5 + i * 2}`,
        transformOrigin: 'bottom center',
        duration:      2.8 + i * 0.5,
        ease:          'sine.inOut',
        yoyo:          true,
        repeat:        -1,
        delay:         i * 0.4,
      });
    });

    // Flores — giran lentamente + pulso
    const flowers = document.querySelectorAll('.tdeco-flower');
    flowers.forEach((el, i) => {
      gsap.to(el, {
        rotation:      360,
        duration:      18 + i * 4,
        ease:          'none',
        repeat:        -1,
        transformOrigin: '50% 50%',
      });
      gsap.to(el, {
        scale:    1.12,
        duration: 2.2 + i * 0.3,
        ease:     'sine.inOut',
        yoyo:     true,
        repeat:   -1,
        delay:    i * 0.5,
      });
    });

    // Cocos — caída suave + rebote
    const cocos = document.querySelectorAll('.tdeco-coco');
    cocos.forEach((el, i) => {
      gsap.to(el, {
        y:        `+=${8 + i * 3}`,
        x:        `+=${i % 2 === 0 ? 5 : -5}`,
        rotation: `+=${i % 2 === 0 ? 8 : -6}`,
        duration: 2.5 + i * 0.6,
        ease:     'sine.inOut',
        yoyo:     true,
        repeat:   -1,
        delay:    i * 0.35,
      });
    });
  }

  private initParallax() {
    // Las decoraciones más grandes hacen parallax suave al hacer scroll
    document.querySelectorAll('.tdeco-parallax-slow').forEach(el => {
      gsap.to(el, {
        yPercent: -25,
        ease:     'none',
        scrollTrigger: {
          trigger:  'body',
          start:    'top top',
          end:      'bottom bottom',
          scrub:    2.5,
        },
      });
    });

    document.querySelectorAll('.tdeco-parallax-fast').forEach(el => {
      gsap.to(el, {
        yPercent: -45,
        ease:     'none',
        scrollTrigger: {
          trigger:  'body',
          start:    'top top',
          end:      'bottom bottom',
          scrub:    1.2,
        },
      });
    });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      ScrollTrigger.getAll().forEach(t => t.kill());
      gsap.killTweensOf('.tdeco-leaf, .tdeco-palm, .tdeco-flower, .tdeco-coco');
    }
  }
}
