import { Component, ChangeDetectionStrategy, inject, signal, afterNextRender } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
interface Document {
  id: string;
  type: string;
  status: string;
  uuid: string | null;
  amountCents: number;
  cancellationStatus: string;
}
interface View {
  folio: string;
  issuer: { legalName: string; taxId: string } | null;
  requestedAt: string | null;
  profile: {
    version: number;
    profile: {
      taxId: string;
      legalName: string;
      taxSystem: string;
      zip: string;
      use: string;
      email?: string;
    };
  } | null;
  documents: Document[];
}
interface Fulfillment {
  guarantee: {
    amountCents: number;
    terms: string;
    version: number;
    consentAt: string | null;
    receivedCents: number;
    returnedCents: number;
    appliedCents: number;
  } | null;
  deliveryReady: boolean;
  acknowledgedAt: string | null;
  version: number;
}
@Component({
  selector: 'app-invoice',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './invoice.html',
  styleUrl: './invoice.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Invoice {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private meta = inject(Meta);
  readonly token = this.route.snapshot.paramMap.get('token') ?? '';
  readonly data = signal<View | null>(null);
  readonly fulfillment = signal<Fulfillment | null>(null);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly accept = this.fb.nonNullable.control(false);
  readonly receipt = this.fb.nonNullable.control(false);
  readonly form = this.fb.nonNullable.group({
    taxId: ['', [Validators.required, Validators.pattern(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/)]],
    legalName: ['', Validators.required],
    taxSystem: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
    zip: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    use: ['G03', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    confirmed: [false, Validators.requiredTrue],
  });
  constructor() {
    this.meta.updateTag({ name: 'robots', content: 'noindex,nofollow' });
    this.meta.updateTag({ name: 'referrer', content: 'no-referrer' });
    afterNextRender(() => void this.run(() => this.load()));
  }
  private async run(fn: () => Promise<void>) {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      await fn();
    } catch (e) {
      const m = e instanceof HttpErrorResponse ? e.error?.message : null;
      this.error.set(
        Array.isArray(m)
          ? m.join('. ')
          : typeof m === 'string'
            ? m
            : 'No pudimos completar la solicitud. Intenta de nuevo.',
      );
    } finally {
      this.busy.set(false);
    }
  }
  private async load() {
    const [d, f] = await Promise.all([
      firstValueFrom(this.http.get<View>(environment.apiUrl + '/fiscal/orders/' + this.token)),
      firstValueFrom(this.http.get<Fulfillment>(environment.apiUrl + '/fulfillment/' + this.token)),
    ]);
    this.data.set(d);
    this.fulfillment.set(f);
    if (d.profile) this.form.patchValue(d.profile.profile);
  }
  refresh() {
    void this.run(() => this.load());
  }
  save() {
    if (this.form.invalid) return;
    void this.run(async () => {
      const { confirmed, ...d } = this.form.getRawValue();
      await firstValueFrom(
        this.http.post(environment.apiUrl + '/fiscal/orders/' + this.token + '/customer', {
          ...d,
          version: this.data()?.profile?.version ?? 0,
        }),
      );
      await this.load();
      this.notice.set(
        'Recibimos tus datos fiscales. El equipo revisará tu pedido y podrás consultar la factura aquí.',
      );
    });
  }
  download(d: Document, format: string) {
    void this.run(async () => {
      const r = await firstValueFrom(
        this.http.get<{ url: string }>(
          environment.apiUrl + `/fiscal/orders/${this.token}/documents/${d.id}/${format}`,
        ),
      );
      if (new URL(r.url).protocol !== 'https:') throw new Error('Enlace inválido');
      window.open(r.url, '_blank', 'noopener,noreferrer');
    });
  }
  consent(delivery = false) {
    const f = this.fulfillment();
    if (!f) return;
    void this.run(async () => {
      await firstValueFrom(
        this.http.post(
          environment.apiUrl + `/fulfillment/${this.token}/${delivery ? 'delivery' : 'guarantee'}`,
          {
            confirmed: delivery ? this.receipt.value : this.accept.value,
            version: delivery ? f.version : f.guarantee?.version,
          },
        ),
      );
      await this.load();
      this.notice.set(
        delivery ? 'Recepción confirmada. Gracias.' : 'Aceptación de la garantía registrada.',
      );
    });
  }
  label(s: string) {
    return (
      (
        {
          DRAFT: 'En revisión',
          SENDING: 'En proceso',
          PENDING: 'Pendiente de timbrado',
          VALID: 'Vigente',
          CANCELED: 'Cancelado',
          FAILED: 'Requiere revisión',
          UNKNOWN: 'En conciliación',
        } as Record<string, string>
      )[s] ?? s
    );
  }
}
