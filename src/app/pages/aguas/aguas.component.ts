import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NuestrasAguasComponent } from '../../components/nuestras-aguas/nuestras-aguas.component';

@Component({
  selector: 'app-aguas-page',
  imports: [NuestrasAguasComponent],
  template: `<main><app-nuestras-aguas /></main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AguasPageComponent {}
