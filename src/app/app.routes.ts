import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'cierre/:token',
    loadComponent: () => import('./pages/closure/closure').then((m) => m.Closure),
    title: 'Tu experiencia — Piña Palmera',
  },
  {
    path: 'factura/:token',
    loadComponent: () => import('./pages/invoice/invoice').then((m) => m.Invoice),
    title: 'Mi factura — Piña Palmera',
  },
  {
    path: 'recuperar/:token',
    loadComponent: () => import('./pages/recover/recover').then((m) => m.Recover),
    title: 'Recupera tu evento — Piña Palmera',
  },
  {
    path: 'tienda',
    loadComponent: () => import('./pages/shop/shop').then((m) => m.Shop),
    title: 'Arma tu evento — Piña Palmera',
  },
  {
    path: 'pago/:token',
    loadComponent: () => import('./pages/payment/payment').then((m) => m.Payment),
    title: 'Seguimiento y pago — Piña Palmera',
  },
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Piña Palmera — Aguas frescas para eventos',
  },
  {
    path: 'aguas',
    loadComponent: () => import('./pages/aguas/aguas.component').then((m) => m.AguasPageComponent),
    title: 'Nuestras Aguas — Piña Palmera',
  },
  {
    path: 'menu',
    loadComponent: () =>
      import('./pages/menu-page/menu-page.component').then((m) => m.MenuPageComponent),
    title: 'Menú y Precios — Piña Palmera',
  },
  {
    path: 'experiencia',
    loadComponent: () =>
      import('./pages/experiencia-page/experiencia-page.component').then(
        (m) => m.ExperienciaPageComponent,
      ),
    title: 'La Experiencia — Piña Palmera',
  },
  {
    path: 'concentrados',
    loadComponent: () =>
      import('./pages/concentrados-page/concentrados-page.component').then(
        (m) => m.ConcentradosPageComponent,
      ),
    title: 'Concentrados — Piña Palmera',
  },
  {
    path: 'reservar',
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout),
    title: 'Reserva tu Fecha — Piña Palmera',
  },
  {
    path: 'calaverandia',
    loadComponent: () =>
      import('./pages/calaverandia/calaverandia-page.component').then(
        (m) => m.CalaverandiaPageComponent,
      ),
    title: 'Calaverandia 2025 — Piña Palmera',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
