import fs from 'node:fs';
const dir = new URL('./', import.meta.url);
const text = (x,y,value,size=22,color='#173B2B',weight=400) => `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" fill="${color}" font-weight="${weight}">${value}</text>`;
const arrow=(d,color='#86A693')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" marker-end="url(#arrow)"/>`;
function step(x,n,title,lines){return `<rect x="${x}" y="300" width="340" height="150" rx="18" fill="white" stroke="#D5E2D6"/><circle cx="${x+34}" cy="335" r="15" fill="#EDF3EB"/>${text(x+25,341,n,16,'#1B6B35',700)}${text(x+24,380,title,25,'#173B2B',700)}${lines.map((s,i)=>text(x+24,411+i*24,s,19,'#5E7466')).join('')}`;}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1100" viewBox="0 0 1600 1100" role="img" aria-labelledby="title desc">
<title id="title">Piña Palmera: de la compra a la entrega y la facturación</title><desc id="desc">El cliente elige productos y fecha, consulta su cotización, confirma el pedido y realiza el pago. Al verificarse el cobro, el negocio prepara y entrega. Si corresponde, registra devoluciones. En paralelo, cuando aplica, se validan los datos fiscales y el RFC emisor, se emite el CFDI y se ponen a disposición XML y PDF. El panel permite dar seguimiento a todos los pasos.</desc>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="#86A693" stroke-width="1.7"/></marker></defs>
<rect width="1600" height="1100" fill="#F7F8F2"/>
<rect x="0" y="0" width="1600" height="12" fill="#1B6B35"/>
${text(72,69,'PIÑA PALMERA',21,'#1B6B35',700)}
${text(1200,69,'RECORRIDO DEL SERVICIO',15,'#5E7466',700)}
${text(72,145,'De la compra al evento,',57,'#173B2B',700)}
${text(72,208,'todo conectado.',57,'#173B2B',700)}
${text(72,251,'Una experiencia sencilla para el cliente. Un solo lugar para administrar el negocio.',24,'#5E7466')}
${step(72,'1','Elige tu evento',['Productos, cantidades y fecha.'])}
${step(444,'2','Consulta tu cotización',['Precios y disponibilidad','según las reglas del negocio.'])}
${step(816,'3','Confirma tu pedido',['Datos de contacto, entrega','y condiciones del servicio.'])}
${step(1188,'4','Realiza el pago',['Con Stripe o transferencia,','según las opciones habilitadas.'])}
${arrow('M 413 375 H 440')}${arrow('M 785 375 H 812')}${arrow('M 1157 375 H 1184')}
${arrow('M 1358 451 V 480 H 800 V 506')}
<rect x="495" y="510" width="610" height="101" rx="18" fill="#173B2B"/>
${text(530,552,'Pago verificado · pedido actualizado',28,'#FFFFFF',700)}
${text(530,584,'Confirmación de Stripe o revisión de la transferencia.',20,'#C9DDCB')}
${arrow('M 800 612 V 642 H 430 V 681')}${arrow('M 800 642 H 1170 V 681')}
<rect x="72" y="685" width="716" height="223" rx="20" fill="#FFFFFF" stroke="#D5E2D6"/>
<rect x="812" y="685" width="716" height="223" rx="20" fill="#FFF8DF" stroke="#EADCAC"/>
${text(101,727,'LA OPERACIÓN',15,'#1B6B35',700)}
${text(101,768,'Preparar, entregar y dar seguimiento',28,'#173B2B',700)}
${text(101,820,'Preparación',23,'#173B2B',700)}
${text(365,820,'Entrega',23,'#173B2B',700)}
${text(585,820,'Devolución',23,'#173B2B',700)}
${arrow('M 255 812 H 342')}${arrow('M 471 812 H 561')}
${text(101,868,'Fechas, responsables y devolución de equipo cuando corresponda.',19,'#5E7466')}
${text(841,727,'FACTURACIÓN · CUANDO APLICA',15,'#8D6719',700)}
${text(841,768,'Emitir la factura del emisor correcto',28,'#173B2B',700)}
${text(841,820,'Datos fiscales',23,'#173B2B',700)}
${text(1130,820,'CFDI',23,'#173B2B',700)}
${text(1318,820,'XML y PDF',23,'#173B2B',700)}
${arrow('M 1018 812 H 1107')}${arrow('M 1207 812 H 1294')}
${text(841,868,'RFC emisor y datos del cliente → emisión mediante Facturapi.',19,'#736843')}
<rect x="72" y="945" width="1456" height="98" rx="18" fill="#E7EFE3"/>
${text(100,985,'UN SOLO PANEL PARA TU EQUIPO',17,'#1B6B35',700)}
${text(100,1019,'Pedidos · cobros · entregas · facturas · avisos en tiempo real',26,'#173B2B',700)}
${text(72,1078,'El flujo se adapta a las reglas, permisos y automatizaciones configuradas para el negocio.',17,'#5E7466')}
</svg>`;
fs.writeFileSync(new URL('pina-palmera-flujo-cliente.svg',dir),svg);
fs.writeFileSync(new URL('pina-palmera-flujo-cliente.html',dir),`<!doctype html><html lang="es"><meta charset="utf-8"><title>Piña Palmera · Recorrido del servicio</title><style>*{box-sizing:border-box}html,body{margin:0;background:#F7F8F2}svg{display:block;width:100%;height:auto}@page{size:1600px 1100px;margin:0}@media print{svg{width:1600px;height:1100px}}</style>${svg}</html>`);
