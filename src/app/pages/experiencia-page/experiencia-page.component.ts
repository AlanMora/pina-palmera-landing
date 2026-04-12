import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ExperienciaComponent } from '../../components/experiencia/experiencia.component';

@Component({
  selector: 'app-experiencia-page',
  imports: [ExperienciaComponent],
  template: `<app-experiencia />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienciaPageComponent {}
