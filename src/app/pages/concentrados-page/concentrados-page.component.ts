import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ConcentradosComponent } from '../../components/concentrados/concentrados.component';

@Component({
  selector: 'app-concentrados-page',
  imports: [ConcentradosComponent],
  template: `<main><app-concentrados /></main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConcentradosPageComponent {}
