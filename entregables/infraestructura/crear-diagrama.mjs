import fs from 'node:fs';
const dir=new URL('./',import.meta.url);
const t=(x,y,s,size=22,color='#173B2B',weight=400)=>`<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" fill="${color}" font-weight="${weight}">${s}</text>`;
const box=(x,y,w,h,fill='#FFFFFF',stroke='#D5E2D6',r=18)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
const line=(d,{arrow=true,dash=false,color='#86A693'}={})=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" ${dash?'stroke-dasharray="7 6"':''} ${arrow?'marker-end="url(#arrow)"':''}/>`;
const domains=[
 ['Identity','Accesos, sesiones','y permisos por RFC','3111','identity'],
 ['Commerce','Catálogo, cotizaciones','y pedidos','3112','commerce'],
 ['Payments','Cobros, reembolsos','y conciliación','3113','payments'],
 ['Billing','Emisores RFC','y facturación CFDI','3114','billing'],
 ['Operations','Entregas, devoluciones','e inventario','3115','operations'],
 ['Notifications','Correos, estados','y reintentos','3116','notifications'],
];
const serviceCards=domains.map(([name,a,b,port,db],i)=>{const x=72+i*280;return box(x,595,252,157)+t(x+22,628,`NESTJS · ${port}`,14,'#66836F',700)+t(x+22,667,name,27,'#173B2B',700)+t(x+22,700,a,19,'#5E7466')+t(x+22,727,b,19,'#5E7466');}).join('');
const dbCards=domains.map(([,a,b,p,db],i)=>{const x=72+i*280;return line(`M ${x+126} 753 V 831`)+box(x+12,835,228,43,'#EEF4EA','#D5E2D6',10)+t(x+31,863,`BD ${db}`,19,'#173B2B',700);}).join('');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1460" viewBox="0 0 1800 1460" role="img" aria-labelledby="title desc">
<title id="title">Infraestructura actual de Piña Palmera</title><desc id="desc">Landing y panel Angular se conectan al API Gateway. Seis servicios NestJS administran identidad, comercio, pagos, facturación, operaciones y notificaciones, cada uno con base y usuario propios en un único PostgreSQL local. NATS JetStream distribuye eventos. Realtime recibe avisos de NATS y actualiza el panel mediante WebSocket. Redis aplica límites y protección de solicitudes. Stripe, Facturapi y SMTP son integraciones externas. Ocho aplicaciones están en Docker Compose. Swarm y alta disponibilidad de producción están pendientes.</desc>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9" fill="none" stroke="#86A693" stroke-width="1.7"/></marker></defs>
<rect width="1800" height="1460" fill="#F7F8F2"/><rect width="1800" height="12" fill="#1B6B35"/>
${t(72,68,'PIÑA PALMERA',21,'#1B6B35',700)}${t(1325,68,'ARQUITECTURA ACTUAL · LOCAL',17,'#5E7466',700)}
${t(72,143,'Un sistema conectado, por responsabilidades.',54,'#173B2B',700)}
${t(72,191,'Dos interfaces · ocho aplicaciones NestJS · seis bases de datos por dominio',27,'#5E7466')}
${box(72,235,460,112)}${t(98,267,'EXPERIENCIA DEL CLIENTE',15,'#1B6B35',700)}${t(98,304,'Landing',29,'#173B2B',700)}${t(255,304,'Angular · 4200',21,'#5E7466')}${t(98,331,'Catálogo, cotización y compra',20,'#5E7466')}
${box(598,235,460,112)}${t(624,267,'ADMINISTRACIÓN DEL NEGOCIO',15,'#1B6B35',700)}${t(624,304,'Panel',29,'#173B2B',700)}${t(748,304,'Angular · 4201',21,'#5E7466')}${t(624,331,'Pedidos, pagos, operación y facturas',20,'#5E7466')}
${box(1300,235,428,112,'#E7EFE3')}${t(1326,267,'ACTUALIZACIONES EN TIEMPO REAL',15,'#1B6B35',700)}${t(1326,304,'Realtime',29,'#173B2B',700)}${t(1475,304,'NestJS · 3117',21,'#5E7466')}${t(1326,331,'Sesión validada por Identity · sin BD',19,'#5E7466')}
${line('M 1299 300 H 1063')}${t(1090,276,'WebSocket',18,'#5E7466',700)}
${line('M 302 348 V 398 H 695 V 429')}${line('M 828 348 V 429')}
${t(72,420,'BACKEND',16,'#1B6B35',700)}
${box(570,433,680,106,'#173B2B','#173B2B')}${t(600,475,'API Gateway',30,'#FFFFFF',700)}${t(1012,475,'NestJS · 3100',21,'#C9DDCB')}${t(600,508,'Entrada HTTP · rutas · cookies · límites de solicitudes · sin BD',20,'#C9DDCB')}
${line('M 910 540 V 566',{arrow:false})}${line('M 198 566 H 1598',{arrow:false})}
${domains.map((d,i)=>line(`M ${198+i*280} 566 V 591`)).join('')}
${serviceCards}
${box(72,794,1656,135,'#FFFFFF')}${dbCards}
${t(98,910,'POSTGRESQL 16',18,'#1B6B35',700)}${t(305,910,'Seis bases y usuarios separados. En local comparten un solo servidor · puerto 55439.',21,'#5E7466')}
${t(72,974,'COMUNICACIÓN Y CONTROL COMPARTIDOS',16,'#1B6B35',700)}
${box(72,996,800,111)}${t(98,1036,'NATS JetStream',27,'#173B2B',700)}${t(630,1036,'Puerto 54222',18,'#66836F')}${t(98,1067,'Eventos entre servicios · Outbox / Inbox · reintentos',21,'#5E7466')}${t(98,1093,'Realtime recibe los avisos y los envía al panel.',19,'#5E7466')}
${box(904,996,824,111)}${t(930,1036,'Redis',27,'#173B2B',700)}${t(1480,1036,'Puerto 56379',18,'#66836F')}${t(930,1067,'Límites de solicitudes y protección contra repetición',21,'#5E7466')}${t(930,1093,'Compartido por el gateway y los servicios.',19,'#5E7466')}
${t(72,1152,'INTEGRACIONES EXTERNAS',16,'#8D6719',700)}
${box(72,1173,532,111,'#FFF8DF','#EADCAC')}${t(98,1212,'Payments ↔ Stripe',26,'#173B2B',700)}${t(98,1242,'Cobros y reembolsos; confirmación por webhook.',19,'#736843')}${t(98,1267,'Los webhooks ingresan por el API Gateway.',18,'#736843')}
${box(634,1173,532,111,'#FFF8DF','#EADCAC')}${t(660,1212,'Billing ↔ Facturapi',26,'#173B2B',700)}${t(660,1242,'CFDI y varios RFC emisores; ecosistema SAT.',19,'#736843')}${t(660,1267,'Los webhooks ingresan por el API Gateway.',18,'#736843')}
${box(1196,1173,532,111,'#FFF8DF','#EADCAC')}${t(1222,1212,'Notifications → Correo',26,'#173B2B',700)}${t(1222,1242,'Proveedor SMTP para enviar notificaciones.',19,'#736843')}${t(1222,1267,'Integraciones según cuentas y configuración.',18,'#736843')}
<path d="M 72 1322 H 1728" stroke="#CEDBCF" stroke-width="1"/>
${t(72,1356,'HOY EN LOCAL',17,'#1B6B35',700)}${t(72,1386,'Docker Compose · 8 apps saludables · PostgreSQL, Redis y NATS de una instancia',21,'#173B2B',700)}
${t(72,1421,'Pendiente en producción: Swarm, réplicas entre servidores, HTTPS, respaldos y monitoreo centralizado.',20,'#736843')}
</svg>`;
fs.writeFileSync(new URL('pina-palmera-infraestructura.svg',dir),svg);
fs.writeFileSync(new URL('pina-palmera-infraestructura.html',dir),`<!doctype html><html lang="es"><meta charset="utf-8"><title>Piña Palmera · Infraestructura actual</title><style>*{box-sizing:border-box}html,body{margin:0;background:#F7F8F2}svg{display:block;width:100%;height:auto}@page{size:1800px 1460px;margin:0}@media print{svg{width:1800px;height:1460px}}</style>${svg}</html>`);
