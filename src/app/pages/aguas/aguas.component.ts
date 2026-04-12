import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NuestrasAguasComponent } from '../../components/nuestras-aguas/nuestras-aguas.component';

@Component({
  selector: 'app-aguas-page',
  imports: [NuestrasAguasComponent],
  template: `<app-nuestras-aguas />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AguasPageComponent {}
