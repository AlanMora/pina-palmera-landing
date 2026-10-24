import {
  Component,
  ChangeDetectionStrategy,
  afterNextRender,
  inject,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HeroComponent } from '../../components/hero/hero.component';
import { CalculadoraComponent } from '../../components/calculadora/calculadora.component';
import { CarritoEventosComponent } from '../../components/carrito-eventos/carrito-eventos.component';
import { ApartaFechaComponent } from '../../components/aparta-fecha/aparta-fecha.component';
import { CalaverandiaTeaserComponent } from '../../components/calaverandia-teaser/calaverandia-teaser.component';
import { VitroleroShowcaseComponent } from '../../components/vitroleros-showcase/vitroleros-showcase.component';
import { FaqComponent } from '../../components/faq/faq.component';
import { CartSidebarService } from '../../services/cart-sidebar.service';
import { CalculadoraService, ServicioPedido } from '../../services/calculadora.service';

gsap.registerPlugin(ScrollTrigger);

interface ServiceMetric {
  label: string;
  value: string;
}

interface UbicacionInfo {
  icono: string;
  titulo: string;
  texto: string;
  nota: string;
}

interface ServiceOption {
  id: ServicioPedido;
  eyebrow: string;
  title: string;
  description: string;
  price: string;
  priceNote: string;
  cta: string;
  featured: boolean;
  accentText: string;
  iconBg: string;
  checkBg: string;
  glow: string;
  highlights: string[];
  metrics: ServiceMetric[];
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, HeroComponent, CalculadoraComponent, CarritoEventosComponent, ApartaFechaComponent, CalaverandiaTeaserComponent, VitroleroShowcaseComponent, FaqComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sidebar = inject(CartSidebarService);
  private readonly calc = inject(CalculadoraService);
  private readonly meta = inject(Meta);

  // Urgencia: sábados restantes en el mes actual
  readonly fechasRestantes: number;
  readonly mesActual: string;
  readonly hayUrgencia: boolean;
  readonly urgenciaMensaje: string;

  readonly serviceOptions: ServiceOption[] = [
    {
      id: 'pickup',
      eyebrow: 'Recoge directo',
      title: 'Pick up sin filas raras',
      description: 'Ideal si quieres controlar tu horario y pasar por los vitroleros en Mid Town Jalisco.',
      price: 'Gratis',
      priceNote: 'No agrega costo de envío',
      cta: 'Usar pick up en mi pedido',
      featured: false,
      accentText: 'text-brand-green-light',
      iconBg: 'bg-brand-green-light/15 text-brand-green-light',
      checkBg: 'bg-brand-green-light',
      glow: 'bg-brand-green-mid/50',
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
      featured: true,
      accentText: 'text-brand-yellow',
      iconBg: 'bg-brand-yellow/15 text-brand-yellow',
      checkBg: 'bg-brand-yellow',
      glow: 'bg-brand-yellow/40',
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
      featured: false,
      accentText: 'text-brand-orange',
      iconBg: 'bg-brand-orange/15 text-brand-orange',
      checkBg: 'bg-brand-orange',
      glow: 'bg-brand-pink/40',
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

  readonly ubicacionInfo: UbicacionInfo[] = [
    { icono: '📍', titulo: 'Dirección',              texto: 'Mid Town Jalisco',               nota: 'Guadalajara, Jalisco' },
    { icono: '🕐', titulo: 'Horario de recolección', texto: 'Lunes a sábado · 9:00 – 18:00',  nota: 'Se coordina horario exacto al confirmar' },
    { icono: '🎉', titulo: 'Pick up',                texto: '¡Sin costo extra!',              nota: 'Ahorra $250 recogiendo directamente' },
  ];

  constructor() {
    // Calcular sábados restantes en el mes
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    let saturdays = 0;
    for (let d = today.getDate(); d <= lastDay; d++) {
      if (new Date(year, month, d).getDay() === 6) saturdays++;
    }
    this.fechasRestantes = saturdays;
    this.mesActual = today.toLocaleDateString('es-MX', { month: 'long' });
    this.hayUrgencia = saturdays <= 2;
    if (saturdays === 0) {
      this.urgenciaMensaje = `¡Ya no quedan sábados en ${this.mesActual}! Reserva para el próximo mes hoy.`;
    } else if (saturdays === 1) {
      this.urgenciaMensaje = `¡Solo queda 1 sábado disponible en ${this.mesActual}! Aparta antes de que se llene.`;
    } else {
      this.urgenciaMensaje = `Últimos ${saturdays} fines de semana disponibles en ${this.mesActual}.`;
    }

    // Meta tags de la home
    this.meta.updateTag({ name: 'description', content: 'Aguas frescas artesanales tapatías 100% naturales para eventos en Guadalajara. Vitroleros de 20L · 35 bebidas · Sin conservadores · Hechas al día desde 2014.' });
    this.meta.updateTag({ property: 'og:title', content: 'Piña Palmera — Aguas Frescas para Eventos en Guadalajara' });
    this.meta.updateTag({ property: 'og:description', content: '¡Buena vibra líquida! Vitroleros de aguas frescas naturales para tu evento. Clásicas, con piquete, Kids e Infusiones. Pick up en Mid Town Jalisco o envío a domicilio.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: 'Piña Palmera — Aguas Frescas para Eventos en Guadalajara' });
    this.meta.updateTag({ name: 'twitter:description', content: '¡Buena vibra líquida! Vitroleros artesanales 100% naturales para tu evento en GDL.' });

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
