import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowDown,
  LucideArrowRight,
  LucideGlassWater,
  LucideLeaf,
  LucideSnowflake,
  LucideSparkles,
  LucideTag,
} from '@lucide/angular';
import { ExperienceGalleryComponent } from './experience-gallery/experience-gallery.component';
import { ExperiencePlanningComponent } from './experience-planning/experience-planning.component';

@Component({
  selector: 'app-experiencia',
  imports: [
    RouterLink,
    LucideArrowDown,
    LucideArrowRight,
    LucideGlassWater,
    LucideLeaf,
    LucideSnowflake,
    LucideSparkles,
    LucideTag,
    ExperienceGalleryComponent,
    ExperiencePlanningComponent,
  ],
  templateUrl: './experiencia.component.html',
  styleUrls: ['./experience-shared.css', './experiencia.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienciaComponent {
  readonly details = [
    {
      icon: 'glass',
      title: 'Un sabor para compartir',
      text: 'Vitrolero de vidrio templado de 20 litros. Tu mezcla favorita, al centro de la celebración.',
      art: 'limon',
      note: 'EL CORAZÓN DE LA FIESTA',
    },
    {
      icon: 'ice',
      title: 'Fresco, de principio a fin',
      text: 'Hielo para mantener la temperatura y cucharón dosificador para servir a tus invitados.',
      art: 'menta',
      note: 'LISTO PARA DISFRUTARSE',
    },
    {
      icon: 'leaf',
      title: 'El detalle tropical',
      text: 'Frutas y hierbas frescas que acompañan la presentación y le dan vida a tu mesa.',
      art: 'pina',
      note: 'TAMBIÉN ENTRA POR LOS OJOS',
    },
    {
      icon: 'tag',
      title: 'Un toque muy tuyo',
      text: 'Etiqueta personalizada con el nombre de tu evento. Porque los pequeños detalles cuentan.',
      art: 'fresa',
      note: 'HECHO PARA TU MOMENTO',
    },
  ];
}
