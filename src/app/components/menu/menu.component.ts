import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

type Tab = 'clasicos' | 'piquete' | 'kids' | 'infusiones';

interface Categoria {
  id: Tab;
  nombre: string;
  emoji: string;
  precios: string[];
  sabores: string[];
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  readonly tabActivo = signal<Tab>('clasicos');

  readonly categorias: Categoria[] = [
    {
      id: 'clasicos', nombre: 'Clásicos', emoji: '🍹',
      precios: ['$750 azúcar morena', '$850 splenda'],
      sabores: [
        'Horchata fresa berries', 'Limonada frutos rojos', 'Naranja fresa',
        'Limonada lavanda chía', 'Limonada blueberries', 'Hierbabuena limón',
        'Mango maracuyá', 'Mandarina fresa', 'Naranja maracuyá', 'Horchata plátano',
        'Horchata coco', 'Pink lemonade', 'Black lemonade', 'Guanábana pétalos de rosa',
        'Guayaba fresa', 'Guanábana fresa', 'Tamarindo jengibre', 'Piña colada',
        'Tamarindo mango', 'Jamaica fresa', 'Pepino limón menta', 'Guayaba maracuyá',
        'Fresas con crema',
      ],
    },
    {
      id: 'piquete', nombre: 'Con piquete', emoji: '🍸',
      precios: ['$950 azúcar morena', '$1,050 splenda'],
      sabores: [
        'Jamaica fresa vino tinto', 'Limonada gin frutos rojos', 'Tamarindo jengibre mezcal',
        'Piña colada ron', 'Mojito', 'Tinto de verano',
        'Toronja frambuesa vino rosado', 'Jamaiquita mezcal', 'Mango maracuyá mezcal',
      ],
    },
    {
      id: 'kids', nombre: 'Kids', emoji: '🧃',
      precios: ['$690 el vitrolero'],
      sabores: ['Jamaica', 'Limón', 'Horchata'],
    },
    {
      id: 'infusiones', nombre: 'Infusiones', emoji: '🌸',
      precios: ['$380 el vitrolero'],
      sabores: [
        'Toronja naranja limón', 'Pepino romero y menta',
        'Naranja blueberries menta', 'Toronja con romero',
      ],
    },
  ];

  get categoriaActiva(): Categoria {
    return this.categorias.find(c => c.id === this.tabActivo()) ?? this.categorias[0];
  }

  setTab(tab: Tab) { this.tabActivo.set(tab); }
}
