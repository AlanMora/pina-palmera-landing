import { Catalog } from './catalog';
import { Injectable, signal, computed, inject, effect, afterNextRender } from '@angular/core';

export type Categoria = 'clasicos' | 'piquete' | 'kids' | 'infusiones';
export type Endulzante = 'morena' | 'splenda';
export type ServicioPedido = 'pickup' | 'envio' | 'carrito';

export interface VitroleroLinea {
  id: string;
  categoria: Categoria;
  endulzante: Endulzante;
  sabor: string;
}

const INVITADOS_MIN = 10;
const INVITADOS_MAX = 500;
const INVITADOS_STEP = 5;

@Injectable({ providedIn: 'root' })
export class CalculadoraService {
  readonly catalog = inject(Catalog);
  private readonly restored = signal(false);
  constructor() {
    afterNextRender(() => {
      try {
        const raw = JSON.parse(localStorage.getItem('pina-cart-v2') ?? 'null');
        if (raw && Array.isArray(raw.lines))
          this.lineas.set(
            raw.lines
              .filter(
                (l: VitroleroLinea) =>
                  l &&
                  typeof l.id === 'string' &&
                  ['clasicos', 'piquete', 'kids', 'infusiones'].includes(l.categoria) &&
                  ['morena', 'splenda'].includes(l.endulzante) &&
                  typeof l.sabor === 'string',
              )
              .slice(0, 50),
          );
        if (raw) {
          this.incluirCarrito.set(raw.cart === true);
          this.incluirEnvio.set(raw.delivery === true);
          if (Number.isFinite(raw.guests)) this.setInvitados(raw.guests);
        }
      } catch {}
      this.restored.set(true);
    });
    effect(() => {
      const data = {
        lines: this.lineas(),
        cart: this.incluirCarrito(),
        delivery: this.incluirEnvio(),
        guests: this.invitados(),
      };
      if (this.restored())
        try {
          localStorage.setItem('pina-cart-v2', JSON.stringify(data));
        } catch {}
    });
  }
  addProduct(categoria: Categoria, sabor: string, endulzante: Endulzante, quantity = 1) {
    if (
      !this.getSabores(categoria).includes(sabor) ||
      !Number.isFinite(this.catalog.price(categoria, endulzante))
    )
      return;
    const count = Math.max(0, Math.min(50 - this.lineas().length, Math.floor(quantity)));
    this.lineas.update((ls) => [
      ...ls,
      ...Array.from({ length: count }, (_, i) => ({
        id: this.nextId(i),
        categoria,
        sabor,
        endulzante,
      })),
    ]);
  }
  readonly grouped = computed(() => {
    const groups = new Map<
      string,
      { key: string; line: VitroleroLinea; quantity: number; ids: string[] }
    >();
    for (const l of this.lineas()) {
      const key = JSON.stringify([l.categoria, l.sabor, l.endulzante]);
      const g = groups.get(key);
      if (g) {
        g.quantity++;
        g.ids.push(l.id);
      } else groups.set(key, { key, line: l, quantity: 1, ids: [l.id] });
    }
    return [...groups.values()];
  });
  removeGroup(ids: string[]) {
    this.lineas.update((ls) => ls.filter((l) => !ids.includes(l.id)));
  }

  readonly precioEnvio = computed(() => (this.catalog.settings()?.shippingCents ?? NaN) / 100);
  readonly precioCarrito = computed(() => (this.catalog.settings()?.cartCents ?? NaN) / 100);
  getSabores(cat: Categoria): string[] {
    return this.catalog.categories().find((c) => c.id === cat)?.flavors ?? [];
  }
  readonly pedidoValido = computed(
    () =>
      !!this.catalog.data() &&
      this.lineas().length > 0 &&
      this.lineasPedido().every(
        (l) =>
          this.getSabores(l.categoria).includes(l.sabor) && Number.isFinite(this.getPrecioLinea(l)),
      ),
  );
  readonly lineasPedido = computed(() => this.lineas());

  // ── Signals de configuración global (usados por la sección calculadora inline) ──
  readonly invitados = signal(50);
  readonly categoria = signal<Categoria>('clasicos');
  readonly endulzante = signal<Endulzante>('morena');
  readonly incluirEnvio = signal(false);
  readonly incluirCarrito = signal(false);

  // ── Líneas del pedido (carrito) ──
  readonly lineas = signal<VitroleroLinea[]>([]);

  // ── Sugerencia basada en invitados ──
  readonly vitrolerosSugeridos = computed(() => Math.ceil((this.invitados() * 2.5) / 35));

  // vitroleros usa las líneas cuando existen, si no la sugerencia
  readonly vitroleros = computed(() => this.lineas().length);

  readonly litros = computed(() => this.vitroleros() * 20);
  readonly bebidas = computed(() => this.vitroleros() * 35);
  readonly vitMin = computed(() => Math.ceil((this.invitados() * 2) / 35));
  readonly vitMax = computed(() => Math.ceil((this.invitados() * 3) / 35));

  readonly precioUnitario = computed(
    () =>
      this.catalog.price(
        this.categoria(),
        this.mostrarEndulzante() ? this.endulzante() : 'morena',
      ) / 100,
  );

  readonly precioBase = computed(() => {
    const ls = this.lineas();
    if (ls.length > 0) return ls.reduce((sum, l) => sum + this.getPrecioLinea(l), 0);
    return 0;
  });

  readonly precioSugerido = computed(
    () =>
      this.vitrolerosSugeridos() * this.precioUnitario() +
      (this.incluirCarrito() ? this.precioCarrito() : 0),
  );
  readonly precioTotal = computed(
    () =>
      this.precioBase() +
      (this.incluirEnvio() ? this.precioEnvio() : 0) +
      (this.incluirCarrito() ? this.precioCarrito() : 0),
  );

  readonly mostrarEndulzante = computed(
    () => this.catalog.categories().find((c) => c.id === this.categoria())?.priceSplenda != null,
  );

  readonly datosFormulario = computed(() => ({
    invitados: this.invitados(),
    totalCups: this.bebidas(),
    categoria:
      this.lineas().length > 0
        ? [...new Set(this.lineas().map((l) => l.categoria))].join(', ')
        : this.categoria(),
    vitroleros: this.vitroleros(),
    endulzante: this.mostrarEndulzante() ? this.endulzante() : '',
    lineas: this.lineas(),
    servicioEntrega: this.incluirEnvio() ? 'Envío a domicilio' : 'Pick up',
    incluirEnvio: this.incluirEnvio(),
    incluirCarrito: this.incluirCarrito(),
    precioBase: this.precioBase(),
    precioTotal: this.precioTotal(),
  }));

  // ── Precio individual (público para templates) ──
  getPrecioLinea(linea: VitroleroLinea): number {
    return this.catalog.price(linea.categoria, linea.endulzante) / 100;
  }

  // ── Métodos invitados ──
  private normalizeInvitados(value: number): number {
    const clamped = Math.min(INVITADOS_MAX, Math.max(INVITADOS_MIN, value));
    return Math.round(clamped / INVITADOS_STEP) * INVITADOS_STEP;
  }

  setInvitados(value: number) {
    if (!Number.isFinite(value)) return;
    this.invitados.set(this.normalizeInvitados(value));
  }

  ajustarInvitados(delta: number) {
    this.setInvitados(this.invitados() + delta);
  }

  // ── Métodos extras ──
  toggleExtra(extra: 'envio' | 'carrito') {
    if (extra === 'envio') {
      this.incluirEnvio.set(!this.incluirEnvio());
      return;
    }
    this.incluirCarrito.set(!this.incluirCarrito());
  }

  // ── Métodos servicio ──
  aplicarServicio(servicio: ServicioPedido) {
    if (servicio === 'pickup') {
      this.incluirEnvio.set(false);
      return;
    }
    if (servicio === 'envio') {
      this.incluirEnvio.set(true);
      return;
    }
    this.incluirCarrito.set(true);
  }

  isServicioActivo(servicio: ServicioPedido): boolean {
    if (servicio === 'pickup') return !this.incluirEnvio();
    if (servicio === 'envio') return this.incluirEnvio();
    return this.incluirCarrito();
  }

  // ── CRUD de líneas ──
  private nextId(offset = 0): string {
    return `${Date.now() + offset}-${Math.random().toString(36).slice(2, 7)}`;
  }

  agregarLinea(categoria: Categoria = 'clasicos') {
    if (this.lineas().length >= 50) return;
    const linea: VitroleroLinea = {
      id: this.nextId(),
      categoria,
      endulzante: 'morena',
      sabor: this.getSabores(categoria)[0] ?? '',
    };
    this.lineas.update((ls) => [...ls, linea]);
  }

  agregarLineasSugeridas() {
    const n = this.vitrolerosSugeridos();
    const nuevas: VitroleroLinea[] = Array.from({ length: n }, (_, i) => ({
      id: this.nextId(i),
      categoria: this.categoria(),
      endulzante: this.mostrarEndulzante() ? this.endulzante() : ('morena' as Endulzante),
      sabor: this.getSabores(this.categoria())[0] ?? '',
    }));
    this.lineas.set(nuevas);
  }

  eliminarLinea(id: string) {
    this.lineas.update((ls) => ls.filter((l) => l.id !== id));
  }

  actualizarLinea(id: string, patch: Partial<Omit<VitroleroLinea, 'id'>>) {
    this.lineas.update((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  limpiarLineas() {
    this.lineas.set([]);
  }
}
