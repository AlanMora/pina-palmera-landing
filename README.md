# Piña Palmera · Tienda y landing

Angular 21, SSR, Tailwind, Angular Material y Lucide. La API administra catálogo, precios, cotizaciones, disponibilidad y pagos.

- `/tienda`: sabores, cantidades, extras y carrito persistente. Se guardan productos y preferencias; no datos de contacto ni tarjetas.
- `/reservar`: calendario con disponibilidad, cobertura por código postal y aceptación de cotización. Cotización válida por 10 minutos; inventario reservado durante 60 minutos al crear el pedido.
- `/pago/:token`: anticipo o total con Stripe, transferencias, saldo, plazos, operación, cambios y cancelación. La confirmación del cobro proviene del servidor.
- Las páginas de presentación consultan precios del catálogo. El carrito vacío no agrega productos; la calculadora solo orienta la cantidad sugerida.

## Local

```sh
npm ci
npm start -- --host localhost --port 4200
```

Tienda: http://localhost:4200/tienda. API: http://localhost:3100/api. Panel: http://localhost:4201. Revisar `src/environments` para otros entornos. Configuración, migraciones y servicios en el proyecto hermano `pina-palmera-services`.

## Verificación

```sh
npm run build
npm test -- --watch=false
```

Stripe y correo requieren credenciales reales en el servidor. Configurar zonas y capacidad real desde el panel. El build mantiene una advertencia de presupuesto inicial (~583 kB sin comprimir, ~130 kB estimados en transferencia); no impide compilar. Tienda, calendario y seguimiento se cargan por ruta.

## Opciones de compra

Códigos promocionales y total validado por servidor; consentimiento opcional para recordar reservas abandonadas. /recuperar/:token restaura productos y requiere recotizar. El seguimiento ofrece métodos habilitados (tarjeta/Link, transferencia Stripe, OXXO), recibos y consentimiento separado para guardar tarjeta y cobrar el saldo de ese pedido. El cliente puede revocar la autorización automática. MSI depende de elegibilidad y planes ofrecidos por Stripe.

Una transferencia Stripe u OXXO exige al menos siete días antes del evento; la confirmación es diferida. Los métodos adicionales permanecen apagados hasta configurarlos desde el panel y la cuenta Stripe.
