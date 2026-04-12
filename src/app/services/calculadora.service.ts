import { Injectable, signal, computed } from '@angular/core';

export type Categoria = 'clasicos' | 'piquete' | 'kids' | 'infusiones';
export type Endulzante = 'morena' | 'splenda';
export type ServicioPedido = 'pickup' | 'envio' | 'carrito';

const PRECIOS: Record<string, number> = {
  clasicos_morena: 750,
  clasicos_splenda: 850,
  piquete_morena: 950,
  piquete_splenda: 1050,
  kids: 690,
  infusiones: 380,
};

const INVITADOS_MIN = 10;
const INVITADOS_MAX = 500;
const INVITADOS_STEP = 5;

@Injectable({ providedIn: 'root' })
export class CalculadoraService {
  readonly invitados = signal(50);
  readonly categoria = signal<Categoria>('clasicos');
  readonly endulzante = signal<Endulzante>('morena');
  readonly incluirEnvio = signal(false);
  readonly incluirCarrito = signal(false);

  readonly vitroleros = computed(() => Math.ceil(this.invitados() * 2.5 / 35));
  readonly litros = computed(() => this.vitroleros() * 20);
  readonly bebidas = computed(() => this.vitroleros() * 35);
  readonly vitMin = computed(() => Math.ceil(this.invitados() * 2 / 35));
  readonly vitMax = computed(() => Math.ceil(this.invitados() * 3 / 35));

  readonly precioUnitario = computed(() => {
    const cat = this.categoria();
    if (cat === 'kids') return PRECIOS['kids'];
    if (cat === 'infusiones') return PRECIOS['infusiones'];
    const key = `${cat}_${this.endulzante()}`;
    return PRECIOS[key] ?? 750;
  });

  readonly precioBase = computed(() => this.vitroleros() * this.precioUnitario());
  readonly precioTotal = computed(() =>
    this.precioBase()
    + (this.incluirEnvio() ? 250 : 0)
    + (this.incluirCarrito() ? 350 : 0)
  );

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

  toggleExtra(extra: 'envio' | 'carrito') {
    if (extra === 'envio') {
      this.incluirEnvio.set(!this.incluirEnvio());
      return;
    }

    this.incluirCarrito.set(!this.incluirCarrito());
  }

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
    if (servicio === 'pickup') {
      return !this.incluirEnvio();
    }

    if (servicio === 'envio') {
      return this.incluirEnvio();
    }

    return this.incluirCarrito();
  }

  readonly datosFormulario = computed(() => ({
    invitados: this.invitados(),
    totalCups: this.bebidas(),
    categoria: this.categoria(),
    vitroleros: this.vitroleros(),
    endulzante: this.mostrarEndulzante() ? this.endulzante() : '',
    servicioEntrega: this.incluirEnvio() ? 'Envío a domicilio' : 'Pick up',
    incluirEnvio: this.incluirEnvio(),
    incluirCarrito: this.incluirCarrito(),
    precioBase: this.precioBase(),
    precioTotal: this.precioTotal(),
  }));

  readonly mostrarEndulzante = computed(() =>
    this.categoria() !== 'kids' && this.categoria() !== 'infusiones'
  );
}
