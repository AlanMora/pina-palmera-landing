import { MAPBOX_TOKEN } from './mapbox-token';

export const environment = {
  production: false,
  // URL base del API — cambia esto por tu endpoint real al desplegar
  apiUrl: 'http://localhost:3000/api',
  mapboxToken: MAPBOX_TOKEN,
};
