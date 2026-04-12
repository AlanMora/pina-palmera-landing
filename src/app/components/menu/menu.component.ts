import { Component, ChangeDetectionStrategy, signal, afterNextRender, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type Tab = 'clasicos' | 'piquete' | 'kids' | 'infusiones';

interface Categoria {
  id: Tab;
  nombre: string;
  emoji: string;
  precios: string[];
  sabores: string[];
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  readonly tabActivo = signal<Tab>('clasicos');

  readonly categorias: Categoria[] = [
    {
      id: 'clasicos', nombre: 'Clásicos', emoji: '🍹',
      precios: ['$750 azúcar morena', '$850 splenda'],
      sabores: [
        'Horchata fresa berries', 'Limonada frutos rojos', 'Naranja fresa',
        'Limonada lavanda chía', 'Limonada blueberries', 'Hierbabuena limón',
        'Mango maracuyá', 'Mandarina fresa', 'Naranja maracuyá', 'Horchata plátano',
        'Horchata coco', 'Pink lemonade', 'Black lemonade', 'Guanábana pétalos de rosa',
        'Guayaba fresa', 'Guanábana fresa', 'Tamarindo jengibre', 'Piña colada',
        'Tamarindo mango', 'Jamaica fresa', 'Pepino limón menta', 'Guayaba maracuyá',
        'Fresas con crema',
      ],
    },
    {
      id: 'piquete', nombre: 'Con piquete', emoji: '🍸',
      precios: ['$950 azúcar morena', '$1,050 splenda'],
      sabores: [
        'Jamaica fresa vino tinto', 'Limonada gin frutos rojos', 'Tamarindo jengibre mezcal',
        'Piña colada ron', 'Mojito', 'Tinto de verano',
        'Toronja frambuesa vino rosado', 'Jamaiquita mezcal', 'Mango maracuyá mezcal',
      ],
    },
    {
      id: 'kids', nombre: 'Kids', emoji: '🧃',
      precios: ['$690 el vitrolero'],
      sabores: ['Jamaica', 'Limón', 'Horchata'],
    },
    {
      id: 'infusiones', nombre: 'Infusiones', emoji: '🌸',
      precios: ['$380 el vitrolero'],
      sabores: [
        'Toronja naranja limón', 'Pepino romero y menta',
        'Naranja blueberries menta', 'Toronja con romero',
      ],
    },
  ];

  get categoriaActiva(): Categoria {
    return this.categorias.find(c => c.id === this.tabActivo()) ?? this.categorias[0];
  }

  setTab(tab: Tab) { this.tabActivo.set(tab); }

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => {
        this.initAnimations();
      });
    });
  }

  private initAnimations() {
    gsap.from('.menu .section-title', {
      scrollTrigger: { trigger: '.menu .section-title', start: 'top 85%' },
      duration: 0.8, y: 50, opacity: 0, ease: 'power2.out',
    });
    gsap.from('.menu-tabs', {
      scrollTrigger: { trigger: '.menu-tabs', start: 'top 85%' },
      duration: 0.7, y: 30, opacity: 0, ease: 'power2.out',
    });
    gsap.from('.menu-content-panel', {
      scrollTrigger: { trigger: '.menu-content-panel', start: 'top 80%' },
      duration: 0.8, y: 40, opacity: 0, ease: 'power2.out',
    });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
  }
}
