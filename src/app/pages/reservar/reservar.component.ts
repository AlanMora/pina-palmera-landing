import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ApartaFechaComponent } from '../../components/aparta-fecha/aparta-fecha.component';

@Component({
  selector: 'app-reservar-page',
  imports: [ApartaFechaComponent],
  template: `<app-aparta-fecha />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservarPageComponent {}
