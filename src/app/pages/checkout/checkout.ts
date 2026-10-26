import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  afterNextRender,
  DestroyRef,
  effect,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  LucideCalendarDays,
  LucideMapPin,
  LucideShieldCheck,
  LucideArrowLeft,
} from '@lucide/angular';
import { CalculadoraService } from '../../services/calculadora.service';
import { environment } from '../../../environments/environment';
interface Availability {
  date: string;
  available: boolean;
  units: number;
  carts: number;
  deliveries: number;
  slots: string[];
}
interface Quote {
  balanceTiming: string;
  balanceAfterHours: number;
  merchant: { legalName: string; taxId: string } | null;
  discountCents: number;
  promoCode: string | null;
  lateBalanceGraceHours: number;
  overduePolicy: string;
  quoteToken: string;
  expiresAt: string;
  totalCents: number;
  depositCents: number;
  shippingCents: number;
  cartCents: number;
  balanceDueAt: string;
  cancellationDeadline: string;
  refundPercent: number;
  returnDate: string;
}
@Component({
  selector: 'app-checkout',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    LucideCalendarDays,
    LucideMapPin,
    LucideShieldCheck,
    LucideArrowLeft,
  ],
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'es-MX' }],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Checkout {
  readonly cart = inject(CalculadoraService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private destroy = inject(DestroyRef);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly quote = signal<Quote | null>(null);
  readonly days = signal<Availability[]>([]);
  readonly slots = signal<string[]>([]);
  readonly calendarReady = signal(false);
  readonly lastOrder = signal('');
  readonly form = this.fb.group({
    date: [null as Date | null, Validators.required],
    time: ['', Validators.required],
    delivery: [false],
    postalCode: [''],
    cart: [false],
    guests: [50, [Validators.required, Validators.min(10), Validators.max(500)]],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    eventType: ['Celebración', Validators.required],
    address: [''],
    notes: ['', Validators.maxLength(2000)],
    accepted: [false, Validators.requiredTrue],
    promoCode: [''],
    recoveryConsent: [false],
    whatsappConsent: [false],
  });
  private attempt: { serialized: string; requestId: string } | null = null;
  readonly minDate = new Date();
  readonly maxDate = new Date(new Date().setDate(new Date().getDate() + 365));
  dateKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  readonly dateFilter = (d: Date | null) => {
    if (!d) return false;
    const day = this.days().find((x) => x.date === this.dateKey(d));
    return (
      !!day?.available &&
      day.units >= this.cart.lineas().length &&
      (!this.form.controls.cart.value || day.carts > 0) &&
      (!this.form.controls.delivery.value || day.deliveries > 0)
    );
  };
  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroy)).subscribe(() => {
      this.quote.set(null);
      this.form.controls.accepted.setValue(false, { emitEvent: false });
      const d = this.form.controls.date.value;
      this.slots.set(this.days().find((x) => d && x.date === this.dateKey(d))?.slots ?? []);
    });
    effect(() => {
      this.cart.lineas();
      this.quote.set(null);
    });
    afterNextRender(() => {
      this.cart.catalog.load();
      this.form.patchValue({
        cart: this.cart.incluirCarrito(),
        delivery: this.cart.incluirEnvio(),
        guests: this.cart.invitados(),
      });
      try {
        this.lastOrder.set(localStorage.getItem('pina-last-order') ?? '');
        this.attempt = JSON.parse(sessionStorage.getItem('pina-order-attempt') ?? 'null');
      } catch {}
      void this.loadCalendar();
    });
  }
  async loadCalendar() {
    this.calendarReady.set(false);
    try {
      const all: Availability[] = [];
      let start = new Date();
      start.setHours(12, 0, 0, 0);
      for (let i = 0; i < 6; i++) {
        const end = new Date(start);
        end.setDate(end.getDate() + 61);
        const result = await firstValueFrom(
          this.http.get<{ days: Availability[] }>(environment.apiUrl + '/shop/availability', {
            params: { from: this.dateKey(start), to: this.dateKey(end) },
          }),
        );
        all.push(...result.days);
        start = new Date(end);
        start.setDate(start.getDate() + 1);
      }
      this.days.set(all);
      this.calendarReady.set(true);
    } catch (e) {
      this.fail(e);
    }
  }
  fail(e: unknown) {
    const msg = e instanceof HttpErrorResponse ? e.error?.message : undefined;
    this.error.set(
      Array.isArray(msg)
        ? msg.join('. ')
        : typeof msg === 'string'
          ? msg
          : 'No pudimos completar la operación. Intenta de nuevo.',
    );
  }
  async review() {
    if (this.busy()) return;
    this.error.set('');
    this.form.markAllAsTouched();
    const f = this.form.getRawValue();
    if (
      !this.cart.pedidoValido() ||
      !f.date ||
      !f.time ||
      !f.name ||
      !f.phone ||
      !f.email ||
      this.form.controls.name.invalid ||
      this.form.controls.phone.invalid ||
      this.form.controls.email.invalid ||
      this.form.controls.guests.invalid ||
      this.form.controls.notes.invalid
    ) {
      this.error.set('Completa los datos de contacto, fecha y horario para continuar.');
      return;
    }
    if (
      f.delivery &&
      (!/^\d{5}$/.test(f.postalCode ?? '') || (f.address ?? '').trim().length < 5)
    ) {
      this.error.set('Ingresa un código postal de 5 dígitos y la dirección completa.');
      return;
    }
    this.busy.set(true);
    try {
      const q = await firstValueFrom(
        this.http.post<Quote>(environment.apiUrl + '/shop/quote', {
          promoCode: f.promoCode?.trim().toUpperCase() || undefined,
          fecha: this.dateKey(f.date),
          hora: f.time,
          incluirEnvio: !!f.delivery,
          incluirCarrito: !!f.cart,
          invitados: f.guests,
          postalCode: f.delivery ? f.postalCode : undefined,
          lineas: this.cart
            .lineas()
            .map(({ categoria, sabor, endulzante }) => ({ categoria, sabor, endulzante })),
        }),
      );
      this.quote.set(q);
      this.form.controls.accepted.setValue(false, { emitEvent: false });
    } catch (e) {
      this.fail(e);
    } finally {
      this.busy.set(false);
    }
  }
  accept(event: Event) {
    this.form.controls.accepted.setValue((event.target as HTMLInputElement).checked, {
      emitEvent: false,
    });
  }
  async place() {
    const q = this.quote();
    if (this.busy() || !q || !this.form.controls.accepted.value) return;
    if (new Date(q.expiresAt) < new Date()) {
      this.error.set('El total expiró. Revisa nuevamente tu cotización.');
      this.quote.set(null);
      return;
    }
    this.busy.set(true);
    this.error.set('');
    const f = this.form.getRawValue();
    const payload = {
      recoveryConsent: !!f.recoveryConsent,
      whatsappConsent: !!f.whatsappConsent,
      quoteToken: q.quoteToken,
      nombre: f.name,
      telefono: f.phone,
      email: f.email,
      tipoEvento: f.eventType,
      direccion: f.delivery ? f.address : 'Recolección en Midtown Jalisco',
      notas: f.notes ?? '',
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
