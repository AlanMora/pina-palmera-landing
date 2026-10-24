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
  readonly urlComoLlegar =
    `https://www.google.com/maps/dir/?api=1&destination=${PUNTO_RECOLECCION[1]},${PUNTO_RECOLECCION[0]}`;

  private map?: MapboxMap;
  private observer?: IntersectionObserver;

  constructor() {
    // Solo en navegador. El mapa (y su "map load" facturable) se crea únicamente
    // cuando la sección está por entrar en pantalla: quien no baja hasta aquí no consume.
    afterNextRender(() => {
      const el = this.contenedor().nativeElement;
      this.observer = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.observer?.disconnect();
          this.cargarMapa(el);
        }
      }, { rootMargin: '300px 0px' });
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
      mapboxgl.workerUrl = '/vendor/mapbox-gl-csp-worker.js';
      mapboxgl.accessToken = environment.mapboxToken;

      const map = new mapboxgl.Map({
        container: el,
        style: 'mapbox://styles/mapbox/standard',
        config: {
          basemap: {
            lightPreset: 'night',
            showPointOfInterestLabels: false,
            showTransitLabels: false,
          },
        },
        center: PUNTO_RECOLECCION,
        zoom: 12.5,
        pitch: 45,
        bearing: -15,
        cooperativeGestures: true, // en móvil el scroll de la página no se queda atrapado en el mapa
        attributionControl: false,
        locale: {
          'ScrollZoomBlocker.CtrlMessage': 'Usa ctrl + scroll para hacer zoom',
          'ScrollZoomBlocker.CmdMessage': 'Usa ⌘ + scroll para hacer zoom',
          'TouchPanBlocker.Message': 'Usa dos dedos para mover el mapa',
        },
      });
      this.map = map;

      map.addControl(new mapboxgl.AttributionControl({ compact: true }));
      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

      new mapboxgl.Marker({ element: this.crearMarcador(), anchor: 'bottom' })
        .setLngLat(PUNTO_RECOLECCION)
        .addTo(map);

      map.once('load', () => {
        this.estado.set('listo');
        map.flyTo({ center: PUNTO_RECOLECCION, zoom: 15.6, pitch: 55, bearing: -25, duration: 2600, essential: true });
      });
      map.on('error', () => {
        if (this.estado() !== 'listo') this.estado.set('error');
      });
    } catch (err) {
      // Sin WebGL o sin red: se muestra la tarjeta de respaldo con el enlace.
      console.error('No se pudo cargar el mapa', err);
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

  ngOnDestroy() {
    this.observer?.disconnect();
    this.map?.remove();
  }
}
