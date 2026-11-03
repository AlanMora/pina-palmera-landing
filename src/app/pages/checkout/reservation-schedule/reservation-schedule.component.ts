import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule, MatDatepickerIntl } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import {
  LucideMapPin,
  LucideTruck,
  LucideCalendarDays,
  LucideClock3,
  LucideRefreshCw,
  LucideSparkles,
} from '@lucide/angular';
import { CalculadoraService } from '../../../services/calculadora.service';
import { ReservationForm, fieldError, eventDateLabel } from '../checkout-form';

function spanishCalendar() {
  const intl = new MatDatepickerIntl();
  Object.assign(intl, {
    calendarLabel: 'Calendario de disponibilidad',
    prevMonthLabel: 'Mes anterior',
    nextMonthLabel: 'Mes siguiente',
    prevYearLabel: 'Año anterior',
    nextYearLabel: 'Año siguiente',
    prevMultiYearLabel: 'Años anteriores',
    nextMultiYearLabel: 'Años siguientes',
    switchToMonthViewLabel: 'Elegir día del mes',
    switchToMultiYearViewLabel: 'Elegir mes y año',
  });
  return intl;
}
@Component({
  selector: 'app-reservation-schedule',
  imports: [
    ReactiveFormsModule,
    MatDatepickerModule,
    LucideMapPin,
    LucideTruck,
    LucideCalendarDays,
    LucideClock3,
    LucideRefreshCw,
    LucideSparkles,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-MX' },
    { provide: MatDatepickerIntl, useFactory: spanishCalendar },
  ],
  templateUrl: './reservation-schedule.component.html',
  styleUrls: ['../checkout-fields.css', './reservation-schedule.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationScheduleComponent {
  readonly form = input.required<ReservationForm>();
  readonly calendarReady = input(false);
  readonly calendarLoading = input(false);
  readonly calendarError = input('');
  readonly dateFilter = input.required<(date: Date | null) => boolean>();
  readonly slots = input<string[]>([]);
  readonly minDate = input.required<Date>();
  readonly maxDate = input.required<Date>();
  readonly dateSelected = output<Date | null>();
  readonly retryCalendar = output<void>();
  readonly cart = inject(CalculadoraService);
  readonly fieldError = fieldError;
  readonly dateLabel = eventDateLabel;
}
