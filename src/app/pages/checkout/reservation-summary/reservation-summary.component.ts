import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  afterNextRender,
  DestroyRef,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideShoppingBag,
  LucideArrowRight,
  LucideShieldCheck,
  LucideChevronDown,
} from '@lucide/angular';
import { CalculadoraService } from '../../../services/calculadora.service';
import { flavorArtwork } from '../../../components/menu/menu-flavor-card/flavor-artwork';
import { ReservationForm, ReservationStep, Quote, eventDateLabel } from '../checkout-form';
@Component({
  selector: 'app-reservation-summary',
  imports: [RouterLink, LucideShoppingBag, LucideArrowRight, LucideShieldCheck, LucideChevronDown],
  templateUrl: './reservation-summary.component.html',
  styleUrl: './reservation-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationSummaryComponent {
  readonly wide = signal(false);
  private readonly destroy = inject(DestroyRef);
  readonly values = input.required<Partial<ReturnType<ReservationForm['getRawValue']>>>();
  readonly quote = input<Quote | null>(null);
  readonly step = input<ReservationStep>(1);
  readonly cart = inject(CalculadoraService);
  readonly dateLabel = eventDateLabel;
  readonly artwork = flavorArtwork;
  readonly subtotal = computed(() =>
    Math.round(
      this.cart.precioBase() * 100 +
        (this.values().cart ? (this.cart.catalog.settings()?.cartCents ?? NaN) : 0),
    ),
  );
  constructor() {
    afterNextRender(() => {
      const media = matchMedia('(min-width: 1001px)');
      const update = () => this.wide.set(media.matches);
      update();
      media.addEventListener('change', update);
      this.destroy.onDestroy(() => media.removeEventListener('change', update));
    });
  }
}
