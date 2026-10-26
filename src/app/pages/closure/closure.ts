import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  afterNextRender,
  DestroyRef,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ClosureView {
  folio: string;
  name: string;
  eventDate: string;
  totalCents: number;
  paidCents: number;
  balanceCents: number;
  balanceDueAt: string | null;
  collectionPaused: boolean;
  supportStatus: string;
  whatsappConsent: boolean;
  survey: { rating: number; comment: string; answeredAt: string; contactRequested: boolean } | null;
  paymentPath: string;
  invoicePath: string;
}

@Component({
  selector: 'app-closure',
  imports: [CurrencyPipe, DatePipe, RouterLink, ReactiveFormsModule],
  templateUrl: './closure.html',
  styleUrl: './closure.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Closure {
  private readonly http = inject(HttpClient);
  private readonly token = inject(ActivatedRoute).snapshot.paramMap.get('token') ?? '';
  private readonly fb = inject(FormBuilder);
  readonly data = signal<ClosureView | null>(null);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly stars = [1, 2, 3, 4, 5];
  readonly survey = this.fb.nonNullable.group({
    rating: [0, [Validators.min(1), Validators.max(5)]],
    comment: ['', Validators.maxLength(2000)],
    contactRequested: [false],
  });
  readonly help = this.fb.nonNullable.group({
    message: ['', [Validators.minLength(5), Validators.maxLength(2000), Validators.required]],
  });
  private surveyId = '';
  private helpId = '';
  constructor() {
    const meta = inject(Meta);
    meta.updateTag({ name: 'robots', content: 'noindex,nofollow' });
    meta.updateTag({ name: 'referrer', content: 'no-referrer' });
    let timer: ReturnType<typeof setInterval> | undefined;
    afterNextRender(() => {
      void this.load();
      timer = setInterval(() => {
        if (!this.busy()) void this.load(false);
      }, 30000);
    });
    inject(DestroyRef).onDestroy(() => {
      if (timer) clearInterval(timer);
      meta.removeTag('name="referrer"');
    });
  }
  async load(initial = true) {
    try {
      this.data.set(
        await firstValueFrom(
          this.http.get<ClosureView>(environment.apiUrl + '/closures/' + this.token),
        ),
      );
    } catch (e) {
      if (initial) this.error.set(this.message(e));
    } finally {
      this.loading.set(false);
    }
  }
  private message(e: unknown) {
    return e instanceof HttpErrorResponse && typeof e.error?.message === 'string'
      ? e.error.message
      : 'No pudimos completar la solicitud. Intenta de nuevo.';
  }
  private async send(path: string, body: unknown, message: string) {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    try {
      this.data.set(
        await firstValueFrom(
          this.http.post<ClosureView>(
            environment.apiUrl + '/closures/' + this.token + '/' + path,
            body,
          ),
        ),
      );
      this.notice.set(message);
    } catch (e) {
      this.error.set(this.message(e));
    } finally {
      this.busy.set(false);
    }
  }
  submitSurvey() {
    if (this.survey.invalid) {
      this.survey.markAllAsTouched();
      return;
    }
    this.surveyId ||= crypto.randomUUID();
    return this.send(
      'survey',
      { ...this.survey.getRawValue(), requestId: this.surveyId },
      'Gracias por compartir tu experiencia.',
    );
  }
  requestHelp() {
    if (this.help.invalid) {
      this.help.markAllAsTouched();
      return;
    }
    this.helpId ||= crypto.randomUUID();
    return this.send(
      'help',
      { ...this.help.getRawValue(), requestId: this.helpId },
      'Registramos tu solicitud. Nuestro equipo te contactará.',
    );
  }
  consent(enabled: boolean) {
    return this.send(
      'whatsapp',
      { enabled },
      enabled
        ? 'Preferencia de contacto registrada.'
        : 'Se desactivaron los mensajes por WhatsApp.',
    );
  }
}
