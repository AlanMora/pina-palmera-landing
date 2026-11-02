import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ExperienciaComponent } from '../../components/experiencia/experiencia.component';

@Component({
  selector: 'app-experiencia-page',
  imports: [ExperienciaComponent],
  template: `<main><app-experiencia /></main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienciaPageComponent {}
