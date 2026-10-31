import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import type { Map as MapboxMap } from 'mapbox-gl';
import { environment } from '../../../environments/environment';

// Midtown Jalisco — C. Colomos 2339, Italia Providencia, Guadalajara.
// Coordenadas fijas: no se usa geocodificación (cada búsqueda cuenta como petición).
const PUNTO_RECOLECCION: [number, number] = [-103.37599, 20.69457];

type EstadoMapa = 'esperando' | 'cargando' | 'listo' | 'error';

@Component({
  selector: 'app-mapa-ubicacion',
  templateUrl: './mapa-ubicacion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapaUbicacionComponent implements OnDestroy {
  private readonly contenedor = viewChild.required<ElementRef<HTMLDivElement>>('mapa');

  readonly estado = signal<EstadoMapa>('esperando');
  readonly urlComoLlegar = `https://www.google.com/maps/dir/?api=1&destination=${PUNTO_RECOLECCION[1]},${PUNTO_RECOLECCION[0]}`;

  private map?: MapboxMap;
  private observer?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;
  private loadTimeout?: ReturnType<typeof setTimeout>;
  private destroyed = false;

  constructor() {
    // Solo en navegador. El mapa (y su "map load" facturable) se crea únicamente
    // cuando la sección está por entrar en pantalla: quien no baja hasta aquí no consume.
    afterNextRender(() => {
      const el = this.contenedor().nativeElement;
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            this.observer?.disconnect();
            this.cargarMapa(el);
          }
        },
        { rootMargin: '300px 0px' },
      );
      this.observer.observe(el);
    });
  }

  private async cargarMapa(el: HTMLDivElement) {
    if (!environment.mapboxToken) {
      this.estado.set('error');
      return;
    }
    this.estado.set('cargando');
    try {
      // Build CSP + worker como archivo aparte: el worker incrustado se rompe al minificar
      const { default: mapboxgl } = await import('mapbox-gl/dist/mapbox-gl-csp.js');
      if (this.destroyed) return;
      if (!mapboxgl.supported()) {
        this.estado.set('error');
        return;
      }
      mapboxgl.workerUrl = '/vendor/mapbox-gl-csp-worker.js';
      mapboxgl.accessToken = environment.mapboxToken;

      const map = new mapboxgl.Map({
        container: el,
        style: 'mapbox://styles/mapbox/streets-v12',
        language: 'es',
        center: PUNTO_RECOLECCION,
        zoom: 15.2,
        pitch: 0,
        bearing: 0,
        dragRotate: false,
        touchPitch: false,
        scrollZoom: false,
        cooperativeGestures: true, // en móvil el scroll de la página no se queda atrapado en el mapa
        attributionControl: false,
        locale: {
          'NavigationControl.ZoomIn': 'Acercar',
          'NavigationControl.ZoomOut': 'Alejar',
          'ScrollZoomBlocker.CtrlMessage': 'Usa ctrl + scroll para hacer zoom',
          'ScrollZoomBlocker.CmdMessage': 'Usa ⌘ + scroll para hacer zoom',
          'TouchPanBlocker.Message': 'Usa dos dedos para mover el mapa',
        },
      });
      this.map = map;
      map.touchZoomRotate.disableRotation();
      map
        .getCanvas()
        .setAttribute('aria-label', 'Mapa del punto de recolección en Midtown Jalisco');
      if ('ResizeObserver' in window) {
        this.resizeObserver = new ResizeObserver(() => map.resize());
        this.resizeObserver.observe(el);
      }
      this.loadTimeout = setTimeout(() => {
        if (!this.destroyed && this.estado() !== 'listo') this.estado.set('error');
      }, 20000);

      map.addControl(new mapboxgl.AttributionControl({ compact: true }));
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

      new mapboxgl.Marker({ element: this.crearMarcador(), anchor: 'bottom' })
        .setLngLat(PUNTO_RECOLECCION)
        .addTo(map);

      map.once('load', () => {
        if (this.destroyed) return;
        clearTimeout(this.loadTimeout);
        map.resize();
        this.estado.set('listo');
      });
      map.on('error', () => {
        if (this.estado() !== 'listo') this.estado.set('error');
      });
    } catch {
      // Sin WebGL o sin red: se muestra la tarjeta de respaldo con el enlace.
      this.estado.set('error');
    }
  }

  private crearMarcador(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'flex flex-col items-center';
    el.setAttribute('aria-label', 'Piña Palmera — punto de recolección');
    el.innerHTML = `
      <div class="mb-1.5 whitespace-nowrap rounded-xl border border-white/15 bg-night/90 px-3 py-1.5 font-nunito text-xs font-extrabold text-white shadow-lg">
        Piña Palmera <span class="text-brand-yellow">· Pick up</span>
      </div>
      <div class="relative flex h-12 w-12 items-center justify-center">
        <span class="motion-safe:animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-brand-yellow/40"></span>
        <span class="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-brand-yellow to-brand-orange text-xl shadow-[0_0_24px_rgba(232,212,77,0.7)]">🍍</span>
      </div>`;
    return el;
  }

  reintentar() {
    if (this.estado() !== 'error' || this.destroyed) return;
    this.resizeObserver?.disconnect();
    clearTimeout(this.loadTimeout);
    this.map?.remove();
    this.map = undefined;
    void this.cargarMapa(this.contenedor().nativeElement);
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.observer?.disconnect();
    this.resizeObserver?.disconnect();
    clearTimeout(this.loadTimeout);
    this.map?.remove();
  }
}
