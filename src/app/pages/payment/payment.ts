import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  afterNextRender,
  OnDestroy,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Meta } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { Catalog } from '../../services/catalog';
interface PublicOrder {
  balanceTiming: string;
  balanceAfterHours: number;
  eventCompletedAt: string | null;
  collectionPaused: boolean;
  closurePath: string | null;
  issuer: {
    legalName: string;
    taxId: string;
    bankName: string;
    bankHolder: string;
    bankClabe: string;
  } | null;
  discountCents: number;
  promoCode: string | null;
  overdueAt: string | null;
  paymentReview: boolean;
  savedCard: boolean;
  autoBalanceAuthorized: boolean;
  lateBalanceGraceHours: number;
  overduePolicy: string;
  paymentOptions: {
    bank: boolean;
    oxxo: boolean;
    installments: boolean;
    installmentsMinCents: number;
    saveCard: boolean;
  };
  eventTime: string;
  operationsStatus: string;
  returnDate: string | null;
  holdUntil: string | null;
  balanceDueAt: string | null;
  cancellationDeadline: string | null;
  refundPercent: number;
  refundDueCents: number;
  changeRequest: string | null;
  lines: { name: string; sabor: string; endulzante: string; unitCents: number }[];
  payments: {
    receiptUrl: string | null;
    method: string;
    disputedCents: number;
    lastError: string | null;
    provider: string;
    status: string;
    amountCents: number;
    refundedCents: number;
    createdAt: string;
  }[];
  folio: string;
  eventDate: string;
  status: string;
  totalCents: number;
  paidCents: number;
  balanceCents: number;
  depositCents: number;
  stripeEnabled: boolean;
}
@Component({
  selector: 'app-payment',
  imports: [RouterLink, DatePipe, ReactiveFormsModule],
  templateUrl: './payment.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Payment implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly meta = inject(Meta);
  readonly catalog = inject(Catalog);
  private fb = inject(FormBuilder);
  readonly paymentForm = this.fb.nonNullable.group({
    method: ['CARD'],
    saveCard: [false],
    autoBalance: [false],
  });
  readonly requestForm = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1000)]],
    confirm: [false, Validators.requiredTrue],
  });
  readonly message = signal('');
  expired(o: PublicOrder) {
    return (
      o.status === 'EXPIRED' ||
      (o.status === 'APPROVED' &&
        o.paidCents === 0 &&
        !!o.holdUntil &&
        new Date(o.holdUntil) < new Date() &&
        !o.payments.some((p) => p.status === 'PENDING'))
    );
  }
  async customerAction(action: 'cancel' | 'changes') {
    if (this.busy() || this.requestForm.invalid) return;
    this.busy.set(true);
    this.error.set('');
    try {
      await firstValueFrom(
        this.http.post(environment.apiUrl + '/shop/orders/' + this.token + '/' + action, {
          reason: this.requestForm.controls.reason.value,
        }),
      );
      this.message.set(
        action === 'cancel'
          ? 'Reserva cancelada. Consulta abajo la devolución elegible.'
          : 'Solicitud enviada. El equipo revisará disponibilidad y cualquier diferencia de precio.',
      );
      this.requestForm.reset();
      await this.load(false);
    } catch (e) {
      const m = (e as { error?: { message?: string } }).error?.message;
      this.error.set(
        typeof m === 'string' ? m : 'No pudimos completar la solicitud. Contacta al equipo.',
      );
    } finally {
      this.busy.set(false);
    }
  }
  operationLabel(s: string) {
    return (
      (
        {
          NEW: 'Por preparar',
          PREPARING: 'En preparación',
          READY: 'Listo para entrega',
          OUT_FOR_DELIVERY: 'En camino',
          DELIVERED: 'Entregado',
          RETURNED: 'Equipos devueltos',
        } as Record<string, string>
      )[s] ?? s
    );
  }
  readonly order = signal<PublicOrder | null>(null);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly token = this.route.snapshot.paramMap.get('token') ?? '';
  readonly returned = this.route.snapshot.queryParamMap.get('resultado') === 'regreso';
  private timer: ReturnType<typeof setInterval> | undefined;
  constructor() {
    this.meta.updateTag({ name: 'robots', content: 'noindex,nofollow' });
    this.meta.updateTag({ name: 'referrer', content: 'no-referrer' });
    afterNextRender(() => {
      void this.load();
      this.timer = setInterval(() => void this.load(false), 10000);
    });
  }
  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.meta.removeTag('name="robots"');
    this.meta.removeTag('name="referrer"');
  }
  async load(showLoading = true) {
    if (showLoading) this.loading.set(true);
    try {
      this.order.set(
        await firstValueFrom(
          this.http.get<PublicOrder>(
            environment.apiUrl + '/orders/public/' + encodeURIComponent(this.token),
          ),
        ),
      );
      this.error.set('');
    } catch {
      this.error.set('No pudimos consultar este pedido. Verifica el enlace o intenta de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }
  async pay(kind: 'DEPOSIT' | 'BALANCE') {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      const r = await firstValueFrom(
        this.http.post<{ url: string }>(
          environment.apiUrl + '/payments/checkout/' + encodeURIComponent(this.token),
          {
            kind,
            method: this.paymentForm.controls.method.value,
            saveCard:
              this.paymentForm.controls.method.value === 'CARD' &&
              this.paymentForm.controls.saveCard.value,
            autoBalance:
              this.paymentForm.controls.method.value === 'CARD' &&
              this.paymentForm.controls.saveCard.value &&
              this.paymentForm.controls.autoBalance.value,
          },
        ),
      );
      const url = new URL(r.url);
      if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com')
        throw new Error('Enlace de pago inválido');
      window.location.assign(url.href);
    } catch (e) {
      const message = (e as { error?: { message?: string } }).error?.message;
      this.error.set(
        typeof message === 'string' ? message : 'No pudimos iniciar el pago. Intenta de nuevo.',
      );
      this.busy.set(false);
    }
  }
  async revoke() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await firstValueFrom(
        this.http.post(environment.apiUrl + '/shop/orders/' + this.token + '/revoke-card', {}),
      );
      this.message.set(
        'La autorización de cobro automático fue revocada. Puedes pagar manualmente.',
      );
      await this.load(false);
    } catch {
      this.error.set('No se pudo revocar mientras hay un cobro en curso. Contacta al equipo.');
    } finally {
      this.busy.set(false);
    }
  }
  label(s: string) {
    return (
      (
        {
          PENDING: 'Estamos revisando disponibilidad',
          APPROVED: 'Tu pedido está listo para pagar',
          CONFIRMED: 'Tu reserva está confirmada',
          DELIVERED: '¡Gracias por celebrar con nosotros!',
          CANCELLED: 'Esta reserva fue cancelada',
          EXPIRED: 'La reserva temporal expiró',
        } as Record<string, string>
      )[s] ?? 'Consultando pedido'
    );
  }
}
