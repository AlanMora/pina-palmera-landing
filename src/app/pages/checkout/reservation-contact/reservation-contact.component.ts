import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LucideMail, LucideUserRound, LucidePhone, LucideMessageSquare } from '@lucide/angular';
import { ReservationForm, fieldError } from '../checkout-form';
@Component({
  selector: 'app-reservation-contact',
  imports: [ReactiveFormsModule, LucideMail, LucideUserRound, LucidePhone, LucideMessageSquare],
  templateUrl: './reservation-contact.component.html',
  styleUrls: ['../checkout-fields.css', './reservation-contact.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationContactComponent {
  readonly form = input.required<ReservationForm>();
  readonly fieldError = fieldError;
}
