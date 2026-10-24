import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CalculadoraService } from '../../services/calculadora.service';
import { ContactService, ApiError, OrderPayload } from '../../services/contact.service';

// Tipos de evento disponibles para el select
const TIPOS_EVENTO = [
  'Boda',
  'XV años',
  'Cumpleaños',
  'Bautizo / Primera comunión',
  'Graduación',
  'Evento corporativo',
  'Reunión familiar',
  'Otro',
] as const;

@Component({
  selector: 'app-aparta-fecha',
  imports: [ReactiveFormsModule],
  templateUrl: './aparta-fecha.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApartaFechaComponent {
  // ── DI ───────────────────────────────────────────────────────────────────
  private readonly fb         = inject(FormBuilder);
  private readonly calc       = inject(CalculadoraService);
  private readonly contact    = inject(ContactService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  // ── Opciones estáticas ───────────────────────────────────────────────────
  readonly tiposEvento = TIPOS_EVENTO;

  // ── Fecha mínima para el input date (hoy + 1 día) ────────────────────────
  readonly minFecha: string = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  // ── Estados del envío ────────────────────────────────────────────────────
  readonly enviando = signal(false);
  readonly enviado  = signal(false);
  readonly error    = signal<ApiError | null>(null);
  readonly folio    = signal('');
  readonly clabeCopiada = signal(false);

  // ── Formulario tipado con nonNullable ────────────────────────────────────
  readonly form = this.fb.nonNullable.group({
    // Sección 1 — Contacto
    nombre:    ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    telefono:  ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    email:     ['', [Validators.email]],
    // Sección 2 — Evento
    tipoEvento: ['', Validators.required],
    fecha:      ['', Validators.required],
    hora:       ['', Validators.required],
    direccion:  ['', [Validators.required, Validators.minLength(5)]],
    // Sección 3 — Detalles opcionales
    sabores: [''],
    notas:   [''],
    // Campos pre-llenados desde CalculadoraService (no se muestran al usuario)
    invitados:       [0],
    vitroleros:      [0],
    categoria:       [''],
    totalCups:       [0],
    endulzante:      [''],
    servicioEntrega: [''],
    incluirEnvio:    [false],
    incluirCarrito:  [false],
    precioBase:      [0],
    precioTotal:     [0],
  });

  // Acceso tipado a los controles (sin string-access)
  readonly f = this.form.controls;

  // ── Reactivity signal: escucha todos los eventos del form (touch, value, status) ──
  // Necesario para que los computed de error funcionen con OnPush
  private readonly _formEvents = toSignal(this.form.events, { initialValue: null });

  // ── Computed de errores por campo ────────────────────────────────────────
  readonly nombreError = computed(() => {
    this._formEvents();
    if (!this.f.nombre.touched || this.f.nombre.valid) return '';
    if (this.f.nombre.hasError('required'))  return 'Tu nombre es obligatorio';
    if (this.f.nombre.hasError('minlength')) return 'Mínimo 2 caracteres';
    return '';
  });

  readonly telefonoError = computed(() => {
    this._formEvents();
    if (!this.f.telefono.touched || this.f.telefono.valid) return '';
    if (this.f.telefono.hasError('required')) return 'El teléfono es obligatorio';
    if (this.f.telefono.hasError('pattern'))  return 'Ingresa 10 dígitos sin espacios ni guiones';
    return '';
  });

  readonly emailError = computed(() => {
    this._formEvents();
    if (!this.f.email.touched || this.f.email.valid) return '';
    return 'Correo electrónico inválido';
  });

  readonly tipoEventoError = computed(() => {
    this._formEvents();
    if (!this.f.tipoEvento.touched || this.f.tipoEvento.valid) return '';
    return 'Selecciona el tipo de evento';
  });

  readonly fechaError = computed(() => {
    this._formEvents();
    if (!this.f.fecha.touched || this.f.fecha.valid) return '';
    return 'Selecciona la fecha de tu evento';
  });

  readonly horaError = computed(() => {
    this._formEvents();
    if (!this.f.hora.touched || this.f.hora.valid) return '';
    return 'Ingresa la hora de inicio';
  });

  readonly direccionError = computed(() => {
    this._formEvents();
    if (!this.f.direccion.touched || this.f.direccion.valid) return '';
    if (this.f.direccion.hasError('required'))  return 'La dirección del evento es obligatoria';
    if (this.f.direccion.hasError('minlength')) return 'Ingresa una dirección más completa';
    return '';
  });

  // ── ¿Hay datos de la calculadora pre-llenados? ──────────────────────────
  readonly tieneResumenCalc = computed(() => this.f.vitroleros.value > 0);

  // ── Constructor ──────────────────────────────────────────────────────────
  constructor() {
    // Pre-llenar campos desde CalculadoraService cuando cambian sus signals
    effect(() => {
      const datos = this.calc.datosFormulario();
      this.form.patchValue({
        invitados:       datos.invitados,
        totalCups:       datos.totalCups,
        categoria:       datos.categoria,
        vitroleros:      datos.vitroleros,
        endulzante:      datos.endulzante,
        servicioEntrega: datos.servicioEntrega,
        incluirEnvio:    datos.incluirEnvio,
        incluirCarrito:  datos.incluirCarrito,
        precioBase:      datos.precioBase,
        precioTotal:     datos.precioTotal,
      });
    });
  }

  // ── Enviar formulario ────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.error.set(null);

    const val = this.form.getRawValue();

    const payload: OrderPayload = {
      nombre:          val.nombre,
      telefono:        val.telefono,
      email:           val.email || undefined,
      tipoEvento:      val.tipoEvento,
      fecha:           val.fecha,
      hora:            val.hora,
      direccion:       val.direccion,
      sabores:         val.sabores || undefined,
      notas:           val.notas || undefined,
      invitados:       val.invitados,
      vitroleros:      val.vitroleros,
      categoria:       val.categoria,
      endulzante:      val.endulzante,
      totalCups:       val.totalCups,
      servicioEntrega: val.servicioEntrega,
      incluirEnvio:    val.incluirEnvio,
      incluirCarrito:  val.incluirCarrito,
      precioBase:      val.precioBase,
      precioTotal:     val.precioTotal,
    };

    this.contact
      .submitOrder(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.enviando.set(false);
          this.folio.set(res.folio ?? '');
          this.enviado.set(true);
        },
        error: (err: ApiError) => {
          this.enviando.set(false);
          this.error.set(err);
        },
      });
  }

  // ── Copiar CLABE al portapapeles ─────────────────────────────────────────
  copyClabe(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    navigator.clipboard.writeText('723969000012458796').then(() => {
      this.clabeCopiada.set(true);
      setTimeout(() => this.clabeCopiada.set(false), 2500);
    });
  }

  // ── Helpers de template ──────────────────────────────────────────────────
  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
