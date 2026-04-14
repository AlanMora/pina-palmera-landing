import { Injectable, signal, computed } from '@angular/core';

export type Categoria = 'clasicos' | 'piquete' | 'kids' | 'infusiones';
export type Endulzante = 'morena' | 'splenda';
export type ServicioPedido = 'pickup' | 'envio' | 'carrito';

export interface VitroleroLinea {
  id: string;
  categoria: Categoria;
  endulzante: Endulzante;
  sabor: string;
}

export const SABORES_POR_CATEGORIA: Record<Categoria, string[]> = {
  clasicos:   ['Jamaica', 'Horchata', 'Limón', 'Tamarindo', 'Sandía', 'Pepino', 'Mango', 'Fresa', 'Guayaba', 'Maracuyá', 'Piña', 'Melón'],
  piquete:    ['Jamaica', 'Horchata', 'Limón', 'Tamarindo', 'Sandía', 'Pepino', 'Mango', 'Fresa', 'Guayaba', 'Maracuyá', 'Piña'],
  kids:       ['Jamaica', 'Horchata', 'Fresa', 'Mango', 'Sandía', 'Limón', 'Guayaba'],
  infusiones: ['Manzanilla', 'Jengibre con limón', 'Hierbabuena', 'Jamaica fría', 'Canela', 'Tila'],
};

const PRECIOS: Record<string, number> = {
  clasicos_morena:  750,
  clasicos_splenda: 850,
  piquete_morena:   950,
  piquete_splenda:  1050,
  kids:             690,
  infusiones:       380,
};

const INVITADOS_MIN  = 10;
const INVITADOS_MAX  = 500;
const INVITADOS_STEP = 5;

@Injectable({ providedIn: 'root' })
export class CalculadoraService {
  // ── Signals de configuración global (usados por la sección calculadora inline) ──
  readonly invitados      = signal(50);
  readonly categoria      = signal<Categoria>('clasicos');
  readonly endulzante     = signal<Endulzante>('morena');
  readonly incluirEnvio   = signal(false);
  readonly incluirCarrito = signal(false);

  // ── Líneas del pedido (carrito) ──
  readonly lineas = signal<VitroleroLinea[]>([]);

  // ── Sugerencia basada en invitados ──
  readonly vitrolerosSugeridos = computed(() => Math.ceil(this.invitados() * 2.5 / 35));

  // vitroleros usa las líneas cuando existen, si no la sugerencia
  readonly vitroleros = computed(() =>
    this.lineas().length > 0 ? this.lineas().length : this.vitrolerosSugeridos()
  );

  readonly litros  = computed(() => this.vitroleros() * 20);
  readonly bebidas = computed(() => this.vitroleros() * 35);
  readonly vitMin  = computed(() => Math.ceil(this.invitados() * 2 / 35));
  readonly vitMax  = computed(() => Math.ceil(this.invitados() * 3 / 35));

  readonly precioUnitario = computed(() => {
    const cat = this.categoria();
    if (cat === 'kids') return PRECIOS['kids'];
    if (cat === 'infusiones') return PRECIOS['infusiones'];
    return PRECIOS[`${cat}_${this.endulzante()}`] ?? 750;
  });

  readonly precioBase = computed(() => {
    const ls = this.lineas();
    if (ls.length > 0) return ls.reduce((sum, l) => sum + this.getPrecioLinea(l), 0);
    return this.vitroleros() * this.precioUnitario();
  });

  readonly precioTotal = computed(() =>
    this.precioBase()
    + (this.incluirEnvio()   ? 250 : 0)
    + (this.incluirCarrito() ? 350 : 0)
  );

  readonly mostrarEndulzante = computed(() =>
    this.categoria() !== 'kids' && this.categoria() !== 'infusiones'
  );

  readonly datosFormulario = computed(() => ({
    invitados:       this.invitados(),
    totalCups:       this.bebidas(),
    categoria:       this.lineas().length > 0
                       ? [...new Set(this.lineas().map(l => l.categoria))].join(', ')
                       : this.categoria(),
    vitroleros:      this.vitroleros(),
    endulzante:      this.mostrarEndulzante() ? this.endulzante() : '',
    lineas:          this.lineas(),
    servicioEntrega: this.incluirEnvio() ? 'Envío a domicilio' : 'Pick up',
    incluirEnvio:    this.incluirEnvio(),
    incluirCarrito:  this.incluirCarrito(),
    precioBase:      this.precioBase(),
    precioTotal:     this.precioTotal(),
  }));

  // ── Precio individual (público para templates) ──
  getPrecioLinea(linea: VitroleroLinea): number {
    if (linea.categoria === 'kids') return PRECIOS['kids'];
    if (linea.categoria === 'infusiones') return PRECIOS['infusiones'];
    return PRECIOS[`${linea.categoria}_${linea.endulzante}`] ?? 750;
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
    if (extra === 'envio') { this.incluirEnvio.set(!this.incluirEnvio()); return; }
    this.incluirCarrito.set(!this.incluirCarrito());
  }

  // ── Métodos servicio ──
  aplicarServicio(servicio: ServicioPedido) {
    if (servicio === 'pickup') { this.incluirEnvio.set(false); return; }
    if (servicio === 'envio')  { this.incluirEnvio.set(true);  return; }
    this.incluirCarrito.set(true);
  }

  isServicioActivo(servicio: ServicioPedido): boolean {
    if (servicio === 'pickup') return !this.incluirEnvio();
    if (servicio === 'envio')  return this.incluirEnvio();
    return this.incluirCarrito();
  }

  // ── CRUD de líneas ──
  private nextId(offset = 0): string {
    return `${Date.now() + offset}-${Math.random().toString(36).slice(2, 7)}`;
  }

  agregarLinea(categoria: Categoria = 'clasicos') {
    const linea: VitroleroLinea = {
      id:         this.nextId(),
      categoria,
      endulzante: 'morena',
      sabor:      SABORES_POR_CATEGORIA[categoria][0],
    };
    this.lineas.update(ls => [...ls, linea]);
  }

  agregarLineasSugeridas() {
    const n = this.vitrolerosSugeridos();
    const nuevas: VitroleroLinea[] = Array.from({ length: n }, (_, i) => ({
      id:         this.nextId(i),
      categoria:  'clasicos' as Categoria,
      endulzante: 'morena'   as Endulzante,
      sabor:      SABORES_POR_CATEGORIA['clasicos'][0],
    }));
    this.lineas.set(nuevas);
  }

  eliminarLinea(id: string) {
    this.lineas.update(ls => ls.filter(l => l.id !== id));
  }

  actualizarLinea(id: string, patch: Partial<Omit<VitroleroLinea, 'id'>>) {
    this.lineas.update(ls => ls.map(l => l.id === id ? { ...l, ...patch } : l));
  }

  limpiarLineas() {
    this.lineas.set([]);
  }
}
