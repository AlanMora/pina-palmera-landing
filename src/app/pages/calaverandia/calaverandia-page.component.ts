import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CalaverandiaComponent } from '../../components/calaverandia/calaverandia.component';

@Component({
  selector: 'app-calaverandia-page',
  imports: [CalaverandiaComponent],
  template: `<app-calaverandia />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalaverandiaPageComponent {}
