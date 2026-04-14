import {
  Component,
  ChangeDetectionStrategy,
  afterNextRender,
  inject,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HeroComponent } from '../../components/hero/hero.component';
import { CalculadoraComponent } from '../../components/calculadora/calculadora.component';
import { CarritoEventosComponent } from '../../components/carrito-eventos/carrito-eventos.component';
import { ApartaFechaComponent } from '../../components/aparta-fecha/aparta-fecha.component';
import { CalaverandiaTeaserComponent } from '../../components/calaverandia-teaser/calaverandia-teaser.component';
import { VitroleroShowcaseComponent } from '../../components/vitroleros-showcase/vitroleros-showcase.component';
import { CartSidebarService } from '../../services/cart-sidebar.service';
import { CalculadoraService, ServicioPedido } from '../../services/calculadora.service';

gsap.registerPlugin(ScrollTrigger);

interface ServiceMetric {
  label: string;
  value: string;
}

interface ServiceOption {
  id: ServicioPedido;
  eyebrow: string;
  title: string;
  description: string;
  price: string;
  priceNote: string;
  cta: string;
  accent: string;
  surface: string;
  panel: string;
  panelTextClass: string;
  panelMutedClass: string;
  highlights: string[];
  metrics: ServiceMetric[];
}

@Component({
  selector: 'app-home',
  imports: [HeroComponent, CalculadoraComponent, CarritoEventosComponent, ApartaFechaComponent, CalaverandiaTeaserComponent, VitroleroShowcaseComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sidebar = inject(CartSidebarService);
  private readonly calc = inject(CalculadoraService);

  readonly serviceOptions: ServiceOption[] = [
    {
      id: 'pickup',
      eyebrow: 'Recoge directo',
      title: 'Pick up sin filas raras',
      description: 'Ideal si quieres controlar tu horario y pasar por los vitroleros en Mid Town Jalisco.',
      price: 'Gratis',
      priceNote: 'No agrega costo de envío',
      cta: 'Usar pick up en mi pedido',
      accent: '#1B6B35',
      surface: 'linear-gradient(135deg, rgba(27,107,53,0.12), rgba(125,201,106,0.10))',
      panel: 'linear-gradient(160deg, #153f26 0%, #1B6B35 60%, #246f3f 100%)',
      panelTextClass: 'text-white',
      panelMutedClass: 'text-white/70',
      highlights: [
        'Recolecta en Mid Town Jalisco.',
        'Perfecto para eventos pequeños o logística propia.',
        'Se coordina horario exacto al confirmar tu pedido.',
      ],
      metrics: [
        { label: 'Costo extra', value: '$0' },
        { label: 'Ideal para', value: 'recoger directo' },
      ],
    },
    {
      id: 'envio',
      eyebrow: 'Más pedido',
      title: 'Envío a domicilio con look premium',
      description: 'La opción más práctica cuando quieres que Piña Palmera llegue lista al evento dentro del periférico.',
      price: '$250',
      priceNote: 'Costo fijo por envío',
      cta: 'Agregar envío a mi pedido',
      accent: '#4CAF6E',
      surface: 'linear-gradient(135deg, rgba(76,175,110,0.15), rgba(232,212,77,0.14))',
      panel: 'linear-gradient(160deg, #eef8f1 0%, #ddf1e2 100%)',
      panelTextClass: 'text-brand-green-dark',
      panelMutedClass: 'text-brand-green-dark/60',
      highlights: [
        'Entrega coordinada según la hora de tu evento.',
        'Cobertura dentro del periférico de Guadalajara.',
        'Se suma al total en tiempo real en la calculadora.',
      ],
      metrics: [
        { label: 'Cobertura', value: 'GDL periférico' },
        { label: 'Coordinación', value: 'hora pactada' },
      ],
    },
    {
      id: 'carrito',
      eyebrow: 'Experiencia completa',
      title: 'Carrito decorado para eventos',
      description: 'Convierte la barra de aguas en parte de la ambientación con una estación montada y lista para lucirse.',
      price: '$350',
      priceNote: 'Renta por evento',
      cta: 'Agregar carrito a mi pedido',
      accent: '#F4A83A',
      surface: 'linear-gradient(135deg, rgba(244,168,58,0.16), rgba(232,212,77,0.18))',
      panel: 'linear-gradient(160deg, #fff6dd 0%, #ffe8a8 100%)',
      panelTextClass: 'text-brand-green-dark',
      panelMutedClass: 'text-brand-green-dark/60',
      highlights: [
        'Hasta 4 vitroleros simultáneos.',
        'Presentación decorada con flores y detalles frescos.',
        'Se puede combinar con el envío para montaje completo.',
      ],
      metrics: [
        { label: 'Capacidad', value: '4 vitroleros' },
        { label: 'Montaje', value: 'listo para lucirse' },
      ],
    },
  ];
  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => {
        this.initAnimations();
      });
    });
  }

  private initAnimations() {
    gsap.from('.service-header', {
      scrollTrigger: { trigger: '.service-cards-section', start: 'top 85%', once: true },
      duration: 0.7, y: 40, opacity: 0, ease: 'power3.out',
      immediateRender: false,
    });

    gsap.from('.service-card', {
      scrollTrigger: { trigger: '.service-cards-section', start: 'top 80%', once: true },
      duration: 0.7, y: 50, opacity: 0, ease: 'power2.out',
      stagger: 0.15,
      immediateRender: false,
    });

    gsap.from('.service-orb', {
      scrollTrigger: { trigger: '.service-cards-section', start: 'top 78%', once: true },
      duration: 0.6, scale: 0.5, opacity: 0, ease: 'back.out(1.8)',
      stagger: 0.15, delay: 0.2,
      immediateRender: false,
    });
  }

  applyService(serviceId: ServicioPedido) {
    this.calc.aplicarServicio(serviceId);
    this.sidebar.open();
  }

  isServiceActive(serviceId: ServicioPedido): boolean {
    return this.calc.isServicioActivo(serviceId);
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
  }
}
