import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideDroplets,
  LucideGlassWater,
  LucideHeart,
  LucideLeaf,
  LucideSparkles,
} from '@lucide/angular';
import { Catalog, CategoryId } from '../../services/catalog';
import { flavorArtwork } from '../menu/menu-flavor-card/flavor-artwork';

@Component({
  selector: 'app-nuestras-aguas',
  imports: [
    RouterLink,
    LucideArrowRight,
    LucideDroplets,
    LucideGlassWater,
    LucideHeart,
    LucideLeaf,
    LucideSparkles,
  ],
  templateUrl: './nuestras-aguas.component.html',
  styleUrls: ['../catalog-story.css', './nuestras-aguas.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuestrasAguasComponent {
  readonly catalog = inject(Catalog);
  readonly artwork = flavorArtwork;
  readonly categories: Record<CategoryId, string> = {
    clasicos: 'Mezclas frutales y cremosas que le dan un giro a tus favoritos.',
    piquete: 'El toque para brindar. Una selección exclusiva para mayores de edad.',
    kids: 'Los sabores que acompañan los grandes momentos de los más pequeños.',
    infusiones: 'Combinaciones cítricas y herbales para refrescar la celebración.',
  };
  readonly values = [
    {
      title: 'Ingredientes que se disfrutan',
      text: 'Fruta, hierbas y mezclas que se reconocen desde el primer sorbo.',
      art: 'fresa',
    },
    {
      title: 'Frescura para tu evento',
      text: 'Preparamos las aguas el día de tu celebración para compartirlas en su mejor momento.',
      art: 'limon',
    },
    {
      title: 'Con raíces tapatías',
      text: 'Desde 2014, un proyecto hecho por mujeres que acompaña los buenos momentos de Guadalajara.',
      art: 'pina',
    },
  ];
}
