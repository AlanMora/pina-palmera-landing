// Escribe el token público de Mapbox desde la variable de entorno MAPBOX_TOKEN.
// Corre en postinstall (Vercel instala dependencias antes de compilar), así el
// token no vive en el repositorio. Sin la variable, el archivo queda como está
// y el mapa muestra su tarjeta de respaldo sin hacer peticiones.
import { writeFileSync } from 'node:fs';

const token = process.env.MAPBOX_TOKEN?.trim();
if (token) {
  writeFileSync(
    new URL('../src/environments/mapbox-token.ts', import.meta.url),
    `export const MAPBOX_TOKEN = '${token}';\n`,
  );
  console.log('Mapbox: token escrito desde MAPBOX_TOKEN');
} else {
  console.log('Mapbox: MAPBOX_TOKEN no definido, el mapa usará la tarjeta de respaldo');
}
