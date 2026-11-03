import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  LucideCalendarDays,
  LucideUserRound,
  LucideArrowRight,
  LucideShieldCheck,
  LucideClock3,
} from '@lucide/angular';
import { CalculadoraService } from '../../../services/calculadora.service';
import { ReservationForm, ReservationStep, Quote, eventDateLabel } from '../checkout-form';
@Component({
  selector: 'app-reservation-review',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    LucideCalendarDays,
    LucideUserRound,
    LucideArrowRight,
    LucideShieldCheck,
    LucideClock3,
  ],
  templateUrl: './reservation-review.component.html',
  styleUrls: ['../checkout-fields.css', './reservation-review.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationReviewComponent {
  readonly form = input.required<ReservationForm>();
  readonly quote = input<Quote | null>(null);
  readonly expired = input(false);
  readonly editStep = output<ReservationStep>();
  readonly cart = inject(CalculadoraService);
  readonly dateLabel = eventDateLabel;
}
