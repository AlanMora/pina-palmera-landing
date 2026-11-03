import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  afterNextRender,
  DestroyRef,
  effect,
  computed,
  Injector,
  untracked,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  LucideCalendarDays,
  LucideShieldCheck,
  LucideArrowLeft,
  LucideArrowRight,
  LucideCheck,
  LucideShoppingBag,
  LucideCircleAlert,
} from '@lucide/angular';
import { CalculadoraService } from '../../services/calculadora.service';
import { environment } from '../../../environments/environment';
import {
  createReservationForm,
  ReservationField,
  ReservationStep,
  Availability,
  Quote,
  normalizedPhone,
} from './checkout-form';
import { ReservationScheduleComponent } from './reservation-schedule/reservation-schedule.component';
import { ReservationContactComponent } from './reservation-contact/reservation-contact.component';
import { ReservationReviewComponent } from './reservation-review/reservation-review.component';
import { ReservationSummaryComponent } from './reservation-summary/reservation-summary.component';

@Component({
  selector: 'app-checkout',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideCalendarDays,
    LucideShieldCheck,
    LucideArrowLeft,
    LucideArrowRight,
    LucideCheck,
    LucideShoppingBag,
    LucideCircleAlert,
    ReservationScheduleComponent,
    ReservationContactComponent,
    ReservationReviewComponent,
    ReservationSummaryComponent,
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Checkout {
  readonly cart = inject(CalculadoraService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  readonly form = createReservationForm(inject(FormBuilder));
  readonly formSnapshot = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });
  readonly step = signal<ReservationStep>(1);
  readonly completed = signal(0);
  readonly busy = signal(false);
  readonly busyLabel = signal('Revisando disponibilidad…');
  readonly error = signal('');
  readonly quote = signal<Quote | null>(null);
  readonly days = signal<Availability[]>([]);
  readonly slots = signal<string[]>([]);
  readonly calendarReady = signal(false);
  readonly calendarLoading = signal(false);
  readonly calendarError = signal('');
  readonly lastOrder = signal('');
  private readonly clock = signal(Date.now());
  readonly steps = [
    { number: 1 as const, label: 'Fecha y entrega', detail: 'Prepara tu evento' },
    { number: 2 as const, label: 'Tus datos', detail: 'Para estar en contacto' },
    { number: 3 as const, label: 'Confirmación', detail: 'Revisa y elige tu pago' },
  ];
  private attempt: { serialized: string; requestId: string } | null = null;
  private lastPricingKey = this.pricingKey();
  readonly minDate = this.businessToday();
  readonly maxDate = new Date(new Date(this.minDate).setDate(this.minDate.getDate() + 365));
  readonly quoteExpired = computed(() => {
    const q = this.quote();
    return (
      !!q && (!Number.isFinite(Date.parse(q.expiresAt)) || Date.parse(q.expiresAt) <= this.clock())
    );
  });
  readonly dateFilter = computed(() => {
    const f = this.formSnapshot();
    const days = this.days();
    const count = this.cart.lineas().length;
    return (date: Date | null) => {
      if (!date) return false;
      const key = this.dateKey(date);
      const day = days.find((d) => d.date === key);
      return (
        key >= this.dateKey(this.minDate) &&
        key <= this.dateKey(this.maxDate) &&
        !!day?.available &&
        day.slots.length > 0 &&
        day.units >= count &&
        (!f.cart || day.carts > 0) &&
        (!f.delivery || day.deliveries > 0)
      );
    };
  });
  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroy)).subscribe(() => {
      this.syncExtraAvailability();
      this.cart.incluirCarrito.set(this.form.controls.cart.value);
      this.cart.incluirEnvio.set(this.form.controls.delivery.value);
      const next = this.pricingKey();
      if (next !== this.lastPricingKey) {
        this.lastPricingKey = next;
        this.invalidateQuote();
      }
    });
    this.form.controls.date.valueChanges
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe(() => this.refreshSlots());
    this.form.controls.delivery.valueChanges
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((delivery) => {
        this.form.controls.postalCode.setValidators(
          delivery ? [Validators.required, Validators.pattern(/^\d{5}$/)] : [],
        );
        this.form.controls.address.setValidators(
          delivery ? [Validators.required, Validators.minLength(5), Validators.maxLength(500)] : [],
        );
        this.form.controls.postalCode.updateValueAndValidity({ emitEvent: false });
        this.form.controls.address.updateValueAndValidity({ emitEvent: false });
      });
    effect(() => {
      this.cart.lineas();
      this.cart.catalog.data();
      untracked(() => {
        this.invalidateQuote();
        this.syncExtraAvailability();
      });
    });
    effect(() => {
      const expired = this.quoteExpired();
      untracked(() => {
        if (expired) {
          this.form.controls.accepted.setValue(false, { emitEvent: false });
          this.form.controls.accepted.disable({ emitEvent: false });
        } else this.form.controls.accepted.enable({ emitEvent: false });
      });
    });
    afterNextRender(() => {
      this.form.patchValue({
        cart: this.cart.incluirCarrito(),
        delivery: this.cart.incluirEnvio(),
        guests: this.cart.invitados(),
      });
      try {
        const last = localStorage.getItem('pina-last-order') ?? '';
        if (/^\/pago\/[a-f0-9]{64}$/.test(last)) this.lastOrder.set(last);
        const attempt = JSON.parse(sessionStorage.getItem('pina-order-attempt') ?? 'null');
        if (
          typeof attempt?.serialized === 'string' &&
          typeof attempt?.requestId === 'string' &&
          /^[a-f0-9-]{36}$/.test(attempt.requestId)
        )
          this.attempt = attempt;
      } catch {}
      const clock = setInterval(() => this.clock.set(Date.now()), 15000);
      this.destroy.onDestroy(() => clearInterval(clock));
      void this.loadCalendar();
    });
  }
  private businessToday() {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const part = (name: string) => Number(parts.find((p) => p.type === name)?.value);
    return new Date(part('year'), part('month') - 1, part('day'));
  }
  dateKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  private pricingKey() {
    const f = this.form.getRawValue();
    return JSON.stringify([
      f.date && this.dateKey(f.date),
      f.time,
      f.delivery,
      f.delivery ? f.postalCode : '',
      f.cart,
      f.guests,
      f.promoCode.trim().toUpperCase(),
      this.cart.lineas(),
      this.cart.catalog.categories(),
      this.cart.catalog.settings()?.cartCents,
    ]);
  }
  private invalidateQuote() {
    this.quote.set(null);
    this.form.controls.accepted.setValue(false, { emitEvent: false });
  }
  private syncExtraAvailability() {
    const price = this.cart.catalog.settings()?.cartCents;
    const available =
      !this.cart.catalog.loading() &&
      !this.cart.catalog.error() &&
      price !== undefined &&
      Number.isFinite(price) &&
      price >= 0;
    if (!this.form.controls.cart.value && !available)
      this.form.controls.cart.disable({ emitEvent: false });
    else this.form.controls.cart.enable({ emitEvent: false });
  }
  private refreshSlots() {
    const d = this.form.controls.date.value;
    const slots = this.days().find((x) => d && x.date === this.dateKey(d))?.slots ?? [];
    this.slots.set(slots);
    if (!slots.includes(this.form.controls.time.value)) this.form.controls.time.setValue('');
  }
  selectDate(date: Date | null) {
    this.form.controls.date.setValue(date);
    this.form.controls.date.markAsTouched();
    this.error.set('');
  }
  async loadCalendar() {
    if (this.calendarLoading()) return;
    this.calendarLoading.set(true);
    this.calendarReady.set(false);
    this.calendarError.set('');
    try {
      const requests = [];
      let start = new Date(this.minDate);
      for (let i = 0; i < 6; i++) {
        const end = new Date(start);
        end.setDate(end.getDate() + 61);
        requests.push(
          firstValueFrom(
            this.http.get<{ days: Availability[] }>(environment.apiUrl + '/shop/availability', {
              params: { from: this.dateKey(start), to: this.dateKey(end) },
            }),
          ),
        );
        start = new Date(end);
        start.setDate(start.getDate() + 1);
      }
      const all = (await Promise.all(requests)).flatMap((r) => r.days);
      this.days.set([...new Map(all.map((d) => [d.date, d])).values()]);
      this.calendarReady.set(true);
      this.refreshSlots();
    } catch {
      this.calendarError.set(
        'No pudimos consultar las fechas. Intenta cargar el calendario de nuevo.',
      );
    } finally {
      this.calendarLoading.set(false);
    }
  }
  private markFields(fields: ReservationField[]) {
    fields.forEach((name) => {
      this.form.controls[name].markAsTouched();
      this.form.controls[name].updateValueAndValidity({ emitEvent: false });
    });
    return fields.every((name) => this.form.controls[name].valid);
  }
  private scheduleValid() {
    const fields: ReservationField[] = ['date', 'time', 'guests', 'eventType'];
    if (this.form.controls.delivery.value) fields.push('postalCode', 'address');
    let valid = this.markFields(fields);
    if (!this.calendarReady()) {
      this.error.set('Espera a que carguen las fechas disponibles.');
      return false;
    }
    const d = this.form.controls.date.value;
    if (d && !this.dateFilter()(d)) {
      this.form.controls.date.setErrors({ unavailable: true });
      valid = false;
    }
    if (!this.slots().includes(this.form.controls.time.value)) {
      this.form.controls.time.setErrors({ required: true });
      valid = false;
    }
    const extra = this.cart.catalog.settings()?.cartCents;
    if (
      this.form.controls.cart.value &&
      (extra === undefined || !Number.isFinite(extra) || extra < 0)
    ) {
      this.error.set(
        'El precio del carrito no está disponible. Retira ese extra o vuelve a intentar más tarde.',
      );
      valid = false;
    }
    return valid;
  }
  private contactValid() {
    this.form.patchValue({
      name: this.form.controls.name.value.trim(),
      email: this.form.controls.email.value.trim(),
      phone: normalizedPhone(this.form.controls.phone.value),
      eventType: this.form.controls.eventType.value.trim(),
      address: this.form.controls.address.value.trim(),
      promoCode: this.form.controls.promoCode.value.trim().toUpperCase(),
    });
    return this.markFields(['name', 'phone', 'email', 'notes', 'promoCode']);
  }
  private focusInvalid() {
    afterNextRender(
      () => {
        const el = this.document.querySelector<HTMLElement>(
          '.reservation-main [aria-invalid="true"]',
        );
        el?.focus({ preventScroll: true });
        el?.scrollIntoView({ block: 'center', behavior: 'instant' });
      },
      { injector: this.injector },
    );
  }
  navigate(target: ReservationStep) {
    if (this.busy() || target > this.completed() + 1) return;
    this.error.set('');
    this.changeStep(target);
  }
  private changeStep(target: ReservationStep) {
    this.step.set(target);
    this.form.controls.accepted.setValue(false, { emitEvent: false });
    afterNextRender(
      () => {
        const heading = this.document.getElementById('reservation-step-title');
        heading?.focus({ preventScroll: true });
        heading?.scrollIntoView({ block: 'start', behavior: 'instant' });
      },
      { injector: this.injector },
    );
  }
  async next() {
    if (this.busy()) return;
    this.error.set('');
    if (!this.cart.pedidoValido()) {
      this.error.set('Revisa los sabores y precios de tu pedido antes de continuar.');
      return;
    }
    if (this.step() === 1) {
      if (!this.scheduleValid()) {
        this.focusInvalid();
        return;
      }
      this.completed.set(Math.max(1, this.completed()));
      this.changeStep(2);
      return;
    }
    if (this.step() === 2) {
      await this.review();
      return;
    }
    if (!this.quote() || this.quoteExpired()) await this.review();
    else await this.place();
  }
  private fail(e: unknown) {
    const msg = e instanceof HttpErrorResponse ? e.error?.message : undefined;
    this.error.set(
      Array.isArray(msg)
        ? msg.join('. ')
        : typeof msg === 'string'
          ? msg
          : 'No pudimos completar la operación. Tus datos siguen aquí; intenta de nuevo.',
    );
  }
  async review() {
    if (this.busy()) return;
    this.error.set('');
    if (!this.contactValid()) {
      this.changeStep(2);
      this.focusInvalid();
      return;
    }
    if (!this.scheduleValid()) {
      this.changeStep(1);
      this.focusInvalid();
      return;
    }
    if (!this.cart.pedidoValido()) {
      this.error.set('Tu pedido cambió. Revisa los sabores antes de continuar.');
      return;
    }
    this.busyLabel.set('Revisando disponibilidad…');
    this.busy.set(true);
    const f = this.form.getRawValue();
    const key = this.pricingKey();
    try {
      const q = await firstValueFrom(
        this.http.post<Quote>(environment.apiUrl + '/shop/quote', {
          promoCode: f.promoCode || undefined,
          fecha: this.dateKey(f.date!),
          hora: f.time,
          incluirEnvio: f.delivery,
          incluirCarrito: f.cart,
          invitados: f.guests,
          postalCode: f.delivery ? f.postalCode : undefined,
          lineas: this.cart
            .lineas()
            .map(({ categoria, sabor, endulzante }) => ({ categoria, sabor, endulzante })),
        }),
      );
      if (key !== this.pricingKey()) {
        this.error.set('Tu pedido cambió durante la consulta. Revisa el total nuevamente.');
        return;
      }
      this.clock.set(Date.now());
      this.quote.set(q);
      this.completed.set(2);
      this.changeStep(3);
    } catch (e) {
      this.fail(e);
    } finally {
      this.busy.set(false);
    }
  }
  async place() {
    const q = this.quote();
    if (this.busy() || !q || !this.form.controls.accepted.value) return;
    if (!this.contactValid()) {
      this.changeStep(2);
      this.focusInvalid();
      return;
    }
    if (!this.scheduleValid()) {
      this.changeStep(1);
      this.focusInvalid();
      return;
    }
    if (this.quote() !== q) {
      this.error.set('Tu pedido cambió. Actualiza el total antes de reservar.');
      return;
    }
    if (!Number.isFinite(Date.parse(q.expiresAt)) || Date.parse(q.expiresAt) <= Date.now()) {
      this.clock.set(Date.now());
      this.error.set('El total venció. Actualízalo antes de continuar.');
      return;
    }
    if (!this.cart.pedidoValido()) {
      this.invalidateQuote();
      this.error.set('El pedido cambió. Revisa el total nuevamente.');
      return;
    }
    this.busyLabel.set('Creando tu pedido…');
    this.busy.set(true);
    this.error.set('');
    const f = this.form.getRawValue();
    const payload = {
      recoveryConsent: f.recoveryConsent,
      whatsappConsent: f.whatsappConsent,
      quoteToken: q.quoteToken,
      nombre: f.name,
      telefono: f.phone,
      email: f.email,
      tipoEvento: f.eventType,
      direccion: f.delivery ? f.address : 'Recolección en Midtown Jalisco',
      notas: f.notes,
    };
    const serialized = JSON.stringify(payload);
    if (this.attempt?.serialized !== serialized) {
      this.attempt = { serialized, requestId: crypto.randomUUID() };
      try {
        sessionStorage.setItem('pina-order-attempt', JSON.stringify(this.attempt));
      } catch {}
    }
    try {
      const order = await firstValueFrom(
        this.http.post<{ paymentPath: string }>(environment.apiUrl + '/shop/orders', {
          ...payload,
          requestId: this.attempt!.requestId,
        }),
      );
      if (!/^\/pago\/[a-f0-9]{64}$/.test(order.paymentPath))
        throw new Error('Invalid payment path');
      try {
        localStorage.setItem('pina-last-order', order.paymentPath);
        sessionStorage.removeItem('pina-order-attempt');
      } catch {}
      this.cart.limpiarLineas();
      await this.router.navigateByUrl(order.paymentPath);
    } catch (e) {
      this.fail(e);
    } finally {
      this.busy.set(false);
    }
  }
}
