import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Piña Palmera — Aguas frescas para eventos',
  },
  {
    path: 'aguas',
    loadComponent: () => import('./pages/aguas/aguas.component').then(m => m.AguasPageComponent),
    title: 'Nuestras Aguas — Piña Palmera',
  },
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu-page/menu-page.component').then(m => m.MenuPageComponent),
    title: 'Menú y Precios — Piña Palmera',
  },
  {
    path: 'experiencia',
    loadComponent: () => import('./pages/experiencia-page/experiencia-page.component').then(m => m.ExperienciaPageComponent),
    title: 'La Experiencia — Piña Palmera',
  },
  {
    path: 'concentrados',
    loadComponent: () => import('./pages/concentrados-page/concentrados-page.component').then(m => m.ConcentradosPageComponent),
    title: 'Concentrados — Piña Palmera',
  },
  {
    path: 'reservar',
    loadComponent: () => import('./pages/reservar/reservar.component').then(m => m.ReservarPageComponent),
    title: 'Reserva tu Fecha — Piña Palmera',
  },
  {
    path: 'calaverandia',
    loadComponent: () => import('./pages/calaverandia/calaverandia-page.component').then(m => m.CalaverandiaPageComponent),
    title: 'Calaverandia 2025 — Piña Palmera',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
