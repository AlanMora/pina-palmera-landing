import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';

const trimmedLength =
  (min: number) =>
  (control: AbstractControl): ValidationErrors | null =>
    typeof control.value === 'string' && control.value.trim().length >= min
      ? null
      : { trimmedLength: true };
const integer = (control: AbstractControl): ValidationErrors | null =>
  Number.isInteger(control.value) ? null : { integer: true };
export function normalizedPhone(raw: string) {
  const digits = raw
    .trim()
    .replace(/[\s().-]/g, '')
    .replace(/^\+/, '');
  return /^52\d{10}$/.test(digits) ? digits.slice(2) : digits;
}
const mexicanPhone = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && /^\d{10}$/.test(normalizedPhone(control.value))
    ? null
    : { mexicanPhone: true };

export function createReservationForm(fb: FormBuilder) {
  return fb.nonNullable.group({
    date: fb.control<Date | null>(null, Validators.required),
    time: ['', Validators.required],
    delivery: false,
    postalCode: '',
    cart: false,
    guests: [50, [Validators.required, Validators.min(10), Validators.max(500), integer]],
    name: ['', [Validators.required, trimmedLength(2), Validators.maxLength(100)]],
    phone: ['', [Validators.required, mexicanPhone]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    eventType: ['Celebración', [Validators.required, trimmedLength(1), Validators.maxLength(100)]],
    address: '',
    notes: ['', Validators.maxLength(2000)],
    accepted: [false, Validators.requiredTrue],
    promoCode: ['', Validators.pattern(/^(?:[A-Za-z0-9_-]{3,30})?$/)],
    recoveryConsent: false,
    whatsappConsent: false,
  });
}
export type ReservationForm = ReturnType<typeof createReservationForm>;
export type ReservationField = keyof ReservationForm['controls'];
export type ReservationStep = 1 | 2 | 3;
export interface Availability {
  date: string;
  available: boolean;
  units: number;
  carts: number;
  deliveries: number;
  slots: string[];
}
export interface Quote {
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
export function fieldError(form: ReservationForm, field: ReservationField) {
  const c = form.controls[field];
  if (!c.touched || !c.invalid) return '';
  const messages: Partial<Record<ReservationField, string>> = {
    date: c.hasError('unavailable')
      ? 'Esta fecha no tiene capacidad para el servicio elegido. Selecciona otra fecha.'
      : 'Selecciona una fecha disponible en el calendario.',
    time: 'Elige uno de los horarios disponibles para esa fecha.',
    guests: 'Escribe una cantidad entera de 10 a 500 invitados.',
    eventType: 'Indica el tipo de evento, con un máximo de 100 caracteres.',
    postalCode: 'Escribe los 5 dígitos de tu código postal.',
    address: 'Escribe la dirección completa, de 5 a 500 caracteres.',
    name: 'Escribe tu nombre, de 2 a 100 caracteres.',
    phone: 'Escribe un teléfono de México con 10 dígitos.',
    email: 'Escribe un correo válido, por ejemplo: nombre@correo.com.',
    notes: 'Las notas pueden tener hasta 2,000 caracteres.',
    promoCode: 'Usa de 3 a 30 letras, números, guiones o guiones bajos.',
  };
  return messages[field] ?? '';
}
export function eventDateLabel(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        date,
      )
    : 'Por elegir';
}
