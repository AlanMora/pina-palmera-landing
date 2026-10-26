import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'cierre/:token', renderMode: RenderMode.Client },
  { path: 'factura/:token', renderMode: RenderMode.Client },
  { path: 'recuperar/:token', renderMode: RenderMode.Client },
  { path: 'reservar', renderMode: RenderMode.Client },
  { path: 'pago/:token', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
