import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const C={bg:'#F6F8F2',ink:'#183D2D',muted:'#607569',green:'#247448',line:'#D4E0D5',soft:'#E8F0E3',yellow:'#F5E9A6',amber:'#8A631C',amberBg:'#FFF6DE',white:'#FFFFFF'};
const esc=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=(x,y,s,size=16,color=C.ink,weight=400)=>`<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(s)}</text>`;
const lines=(x,y,items,size=16,color=C.muted,gap=23)=>items.map((s,i)=>text(x,y+i*gap,s,size,color)).join('');
const box=(x,y,w,h,fill=C.white,stroke=C.line,r=16)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
const arrow=(d,color=C.green,dash=false)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${dash?'stroke-dasharray="5 5"':''} marker-end="url(#arrow)"/>`;
const pill=(x,y,w,label,fill=C.soft,color=C.green)=>box(x,y,w,27,fill,'none',13)+text(x+12,y+18,label,11,color,700);
const header=(n,title,sub,badge)=>`<rect width="1200" height="848" fill="${C.bg}"/><rect width="1200" height="8" fill="${C.green}"/>${text(52,53,'PIÑA PALMERA',17,C.green,700)}${text(52,103,title,34,C.ink,700)}${text(52,133,sub,16,C.muted)}${pill(947,31,201,badge)}<path d="M52 783H1148" stroke="${C.line}"/>${text(52,812,'INFRAESTRUCTURA · 02 NOV 2026',11,C.muted,700)}${text(950,812,`${String(n).padStart(2,'0')} / 03`,12,C.green,700)}`;
const svg=(n,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="848" viewBox="0 0 1200 848" role="img" aria-labelledby="title${n}"><title id="title${n}">Piña Palmera · Infraestructura · Página ${n}</title><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1L8 5L1 9" fill="none" stroke="${C.green}" stroke-width="1.6"/></marker></defs>${body}</svg>`;
const domains=[['Identity','Accesos y sesiones','Permisos por RFC','identity'],['Commerce','Catálogo y pedidos','Reserva de capacidad','commerce'],['Payments','Cobros y reembolsos','Conciliación','payments'],['Billing','Emisores y CFDI','Facturapi','billing'],['Operations','Entregas y retornos','Equipo e insumos','operations'],['Notifications','Correos y estados','Cola y reintentos','notifications']];
let p1=header(1,'Así funciona el entorno local','Docker Compose en tu equipo · una instancia por aplicación · Swarm desactivado','LOCAL · IMPLEMENTADO');
p1+=box(52,166,250,70)+text(68,194,'Tienda / landing',21,C.ink,700)+text(68,219,'Angular · localhost:4200',14,C.muted);
p1+=box(52,260,250,70)+text(68,288,'Panel administrativo',21,C.ink,700)+text(68,313,'Angular · localhost:4201',14,C.muted);
p1+=box(355,207,248,83,C.soft)+text(373,238,'Proxy Caddy',23,C.ink,700)+text(373,265,'Rutas de la web, API y WebSocket',13,C.muted);
p1+=box(661,207,245,83,C.ink,C.ink)+text(681,239,'API Gateway',24,C.white,700)+text(681,265,'NestJS · puerto 3100 · sin BD',14,'#CDDFD0');
p1+=box(953,207,195,83)+text(970,238,'Realtime',22,C.ink,700)+text(970,265,'NestJS · sin BD · 3117',13,C.muted);
p1+=arrow('M302 201H329V248H355')+arrow('M302 295H329V248H355')+arrow('M603 248H661');
p1+=arrow('M480 207V174H1050V207')+text(667,166,'WebSocket del panel',12,C.green,700);
p1+=`<path d="M784 290V361H137M784 361H1062" fill="none" stroke="${C.green}" stroke-width="2"/>`+text(52,350,'SEIS SERVICIOS DE NEGOCIO · CADA UNO CONTROLA SU PROPIA BASE',12,C.green,700);
p1+=box(52,499,1096,80,C.soft);
for(let i=0;i<domains.length;i++){const x=52+i*185,[name,a,b,db]=domains[i];p1+=arrow(`M${x+85} 361V383`)+box(x,387,171,95)+text(x+14,417,name,21,C.ink,700)+lines(x+14,443,[a,b],13,C.muted,20)+arrow(`M${x+85} 482V514`)+box(x+7,518,157,34,C.white,C.line,9)+text(x+18,540,'BD '+db,13,C.ink,700);}
p1+=text(72,570,'PostgreSQL 16: seis bases y usuarios separados en un mismo servidor local.',14,C.muted);
const shared=[['Redis','Límites de solicitudes','Protección contra repetición'],['NATS JetStream','Eventos entre servicios','Outbox / Inbox y reintentos'],['Monitoreo','Prometheus + Blackbox','Alertmanager'],['Respaldos','Copias cifradas con restic','Retención y restauración']];
for(let i=0;i<4;i++){const x=52+i*280;const [title,a,b]=shared[i];p1+=box(x,613,256,96)+text(x+15,642,title,21,C.ink,700)+lines(x+15,667,[a,b],13,C.muted,20);}
p1+=text(52,603,'CAPACIDADES COMPARTIDAS',12,C.green,700);
p1+=lines(52,741,['15 servicios en Compose. PostgreSQL, Redis y NATS conservan sus contenedores y datos existentes.','El WebSocket recibe eventos de NATS; las seis bases son independientes a nivel lógico, no seis servidores.'],14,C.muted,22);
let p2=header(2,'Producción: diseño preparado','Docker Swarm en servidores Linux · definición disponible · despliegue externo pendiente','PRODUCCIÓN · PREPARADA');
p2+=box(52,170,264,74)+text(69,199,'Clientes y equipo',21,C.ink,700)+text(69,224,'Tienda y panel desde navegador',14,C.muted);
p2+=box(365,170,352,74,C.soft)+text(383,199,'Dominio + balanceador',22,C.ink,700)+text(383,224,'DNS, HTTPS y certificados confiables',14,C.muted);
p2+=box(767,170,381,74,C.ink,C.ink)+text(786,199,'Proxy de entrada · 2 réplicas',22,C.white,700)+text(786,224,'Conecta interfaces, API y WebSocket','14','#CDDFD0');
p2+=arrow('M316 207H365')+arrow('M717 207H767')+arrow('M958 244V272');
p2+=box(52,278,1096,307,'#EDF3E8')+text(73,308,'CLUSTER SWARM · TRES MANAGERS LINUX',13,C.green,700)+text(73,333,'Dos réplicas por aplicación, distribuidas en nodos diferentes.',16,C.muted);
for(let n=0;n<3;n++){const x=73+n*363;p2+=box(x,355,329,208)+pill(x+16,370,97,'NODO '+(n+1))+text(x+16,419,'Servidor Linux '+(n+1),23,C.ink,700)+text(x+16,444,'Réplicas de NestJS y Angular',15,C.muted)+text(x+16,467,'Asignación gestionada por Swarm',13,C.muted)+box(x+16,492,297,50,C.ink,C.ink,10)+text(x+30,523,'NATS JetStream · miembro '+(n+1),17,C.white,700);}
p2+=text(52,618,'DATOS EXTERNOS',12,C.green,700);
const external=[['PostgreSQL con TLS','Seis bases por dominio','Disponibilidad a cargo del proveedor'],['Redis con TLS','Acceso y límites compartidos','Disponibilidad a cargo del proveedor'],['Almacenamiento S3','Respaldos cifrados externos','Retención diaria, semanal y mensual']];
for(let i=0;i<3;i++){const x=52+i*374;p2+=arrow(`M${x+170} 585V628`)+box(x,632,348,98)+text(x+16,661,external[i][0],21,C.ink,700)+lines(x+16,686,external[i].slice(1),13,C.muted,20);}
p2+=text(52,758,'Requiere contratar y configurar servidores, redes, dominios, certificados, almacenamiento y cuentas externas.',14,C.amber);
let p3=header(3,'Protección, integraciones y operación','La infraestructura sostiene las ventas, los cobros, la facturación y el seguimiento de eventos.','OPERACIÓN Y CONTINUIDAD');
p3+=box(52,169,529,300)+text(72,202,'Integraciones del negocio',25,C.ink,700);
const integrations=[['Stripe','Cobros y reembolsos desde Payments.'],['Facturapi','CFDI y varios RFC emisores desde Billing.'],['Correo SMTP','Notificaciones mediante el proveedor configurado.'],['Mapbox','Mapa público del punto de recolección.'],['WhatsApp / Meta','Consentimiento y cola preparados; envío pendiente.']];
for(let i=0;i<integrations.length;i++){p3+=text(73,240+i*44,integrations[i][0],17,C.green,700)+text(73,260+i*44,integrations[i][1],13,C.muted);}
p3+=box(611,169,537,300)+text(632,202,'Seguridad y recuperación',25,C.ink,700);
const safety=[['Acceso por rol y RFC','Sesiones y permisos validados en el servicio dueño.'],['Datos separados por dominio','Usuarios de base con acceso limitado.'],['Comunicación interna firmada','Firmas Ed25519 y protección contra repetición.'],['Credenciales fuera de Git','Archivos privados en local; secretos Swarm en producción.'],['Copias cifradas','Retención: 14 diarias, 8 semanales y 12 mensuales.']];
for(let i=0;i<safety.length;i++)p3+=text(632,240+i*44,safety[i][0],17,C.green,700)+text(632,260+i*44,safety[i][1],13,C.muted);
p3+=box(52,492,529,139,C.soft)+text(72,524,'Publicación y cambios',23,C.ink,700)+lines(72,552,['GitHub verifica el código y permite publicar imágenes','con versión identificada por commit. Los scripts de Swarm','validan el entorno antes del despliegue en producción.'],15,C.muted,23);
p3+=box(611,492,537,139,C.soft)+text(632,524,'Monitoreo y alertas',23,C.ink,700)+lines(632,552,['Once sondas de disponibilidad y control de frescura','del respaldo. Registros Docker con rotación. El envío','de alertas externas requiere configurar su destinatario.'],15,C.muted,23);
p3+=box(52,653,1096,101,C.amberBg,'#E8D7A6',14)+text(72,683,'OBSERVACIÓN OPERATIVA · 02 NOV 2026',12,C.amber,700)+lines(72,710,['Las aplicaciones locales reportan operación normal. El servicio de respaldo presenta una alerta de salud','al generar este documento; revisar su última ejecución. Producción todavía no está desplegada.'],15,C.amber,24);
const pages=[svg(1,p1),svg(2,p2),svg(3,p3)];
for(let i=0;i<pages.length;i++)fs.writeFileSync(path.join(dir,`pina-palmera-infraestructura-${i+1}.svg`),pages[i]);
fs.writeFileSync(path.join(dir,'pina-palmera-infraestructura.svg'),pages[0]);
fs.writeFileSync(path.join(dir,'pina-palmera-infraestructura.html'),`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Piña Palmera · Infraestructura</title><style>*{box-sizing:border-box}html,body{margin:0;background:${C.bg}}.page{width:297mm;height:210mm;break-after:page;overflow:hidden}.page:last-child{break-after:auto}svg{width:100%;height:100%;display:block}@page{size:A4 landscape;margin:0}@media screen{body{display:grid;gap:20px;justify-content:center;padding:20px}.page{box-shadow:0 10px 30px #173b2b22}}</style></head><body>${pages.map((p,i)=>`<section id="page${i+1}" class="page">${p}</section>`).join('')}</body></html>`);
console.log('Infraestructura actualizada: 3 páginas.');
