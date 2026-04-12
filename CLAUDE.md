# Piña Palmera — Landing

## Stack
- Angular 21+ standalone components, sin NgModules
- TypeScript estricto (strict: true en tsconfig)
- Angular SSR (Universal) para SEO
- TailwindCSS v4 para TODOS los estilos — CERO SCSS, CERO CSS externo
- GSAP (GreenSock) para animaciones profesionales — NO Angular Animations

## Angular 21+ — reglas OBLIGATORIAS
- Standalone components únicamente, NO NgModules
- NO escribir standalone: true — es el default en v21+
- Signals para todo el estado: signal(), computed(), effect()
- input() y output() functions, NUNCA decoradores @Input/@Output
- inject() en lugar de constructor injection
- Control flow nativo: @if @for @switch — NUNCA *ngIf ni *ngFor
- OnPush change detection en CADA componente sin excepción
- NgOptimizedImage para TODAS las imágenes
- Lazy loading en cada ruta

## TailwindCSS — reglas OBLIGATORIAS
- CERO archivos .scss — no crearlos bajo ningún motivo
- CERO estilos inline con [style] o styleUrls con .css si se puede evitar
- Toda la UI se construye con clases de Tailwind directamente en el template
- Colores de marca como variables CSS en tailwind.config
- Usar @apply solo en casos excepcionales (pseudo-elementos complejos)

## Paleta de marca (configurar en tailwind.config.js)
- brand-green-dark:  #1B6B35  → fondo hero, navbar, footer
- brand-green-mid:   #4CAF6E  → superficies secundarias
- brand-green-light: #7DC96A  → acentos suaves
- brand-yellow:      #E8D44D  → logo, CTAs, highlights
- brand-orange:      #F4A83A  → detalles cálidos
- brand-pink:        #E8546A  → flores, badges especiales

## Tipografía
- Pacifico (Google Fonts) → títulos, hero, headings de sección
- Nunito (Google Fonts) → cuerpo, listas, botones, formularios
- Configurar ambas en tailwind.config bajo fontFamily

## Estructura de carpetas
src/
  app/
    pages/
      home/              → página principal (lazy)
    components/
      hero/              → fondo verde, logo, tagline, CTA
      nuestras-aguas/    → propuesta de valor + badges
      menu/              → 4 cards de categorías
      experiencia/       → qué incluye cada vitrolero
      calculadora/       → calculadora dinámica de vitroleros
      envios/            → pick up y envío, dos columnas
      carrito-eventos/   → card destacada en amarillo
      concentrados/      → sección breve producto secundario
      aparta-fecha/      → formulario reactivo con validación
      navbar/            → navegación sticky con anclas
      footer/            → redes, teléfono, créditos
    services/
      contact.service.ts     → POST /api/orders
      calculadora.service.ts → signals compartidos de la calculadora

## Secciones de la landing (en orden estricto)
1. Hero            → fondo #1B6B35 + hojas decorativas + logo + "¡Buena vibra líquida!" + CTA "Aparta tu fecha"
2. Nuestras aguas  → foto vitroleros + párrafo propuesta + badges: Natural · Sin conservadores · Desde 2014
3. Menú            → tabs o cards: Clásicos ($750/$850) · Con piquete ($950/$1050) · Kids ($690) · Infusiones ($380)
4. La experiencia  → lista de qué incluye + stat "20L = 35 bebidas" + foto 3 tamaños de vaso
5. Calculadora     → componente interactivo (ver spec completa abajo)
6. Envíos          → dos columnas: Pick up (gratis, Mid Town Jalisco) / Envío $250 (periférico GDL)
7. Carrito eventos → card amarilla destacada, renta $350, hasta 4 vitroleros
8. Concentrados    → sección breve, preparar en casa
9. Aparta tu fecha → formulario: nombre, fecha, dirección, hora, sabores, vasos + datos de transferencia

## Calculadora de vitroleros — spec completa
Componente: src/app/components/calculadora/calculadora.component.ts
Servicio:   src/app/services/calculadora.service.ts (providedIn: 'root')
Ancla:      #calculadora

### Constantes fijas
LITROS_POR_VITROLERO  = 20
BEBIDAS_POR_VITROLERO = 35      (presentación 550ml)
BEBIDAS_PROMEDIO      = 2.5     (entre 2 y 3 por invitado)
PRECIO_ENVIO          = 250
PRECIO_CARRITO        = 350

Precios por categoría:
  clasicos_morena  = 750
  clasicos_splenda = 850
  piquete_morena   = 950
  piquete_splenda  = 1050
  kids             = 690
  infusiones       = 380

### CalculadoraService — signals y computed
// signals de entrada
readonly invitados      = signal(50)
readonly categoria      = signal<'clasicos'|'piquete'|'kids'|'infusiones'>('clasicos')
readonly endulzante     = signal<'morena'|'splenda'>('morena')
readonly incluirEnvio   = signal(false)
readonly incluirCarrito = signal(false)

// computed de salida
readonly vitroleros  = computed(() => Math.ceil(this.invitados() * 2.5 / 35))
readonly litros      = computed(() => this.vitroleros() * 20)
readonly bebidas     = computed(() => this.vitroleros() * 35)
readonly vitMin      = computed(() => Math.ceil(this.invitados() * 2 / 35))
readonly vitMax      = computed(() => Math.ceil(this.invitados() * 3 / 35))
readonly precioBase  = computed(() => this.vitroleros() * this.getPrecio())
readonly precioTotal = computed(() =>
  this.precioBase()
  + (this.incluirEnvio()   ? 250 : 0)
  + (this.incluirCarrito() ? 350 : 0)
)
readonly datosFormulario = computed(() => ({
  totalCups: this.bebidas(),
  categoria: this.categoria(),
  vitroleros: this.vitroleros()
}))

### UI del componente
Layout: fondo brand-green-dark, card blanca a la derecha con resultados
Mobile:  flex-col — controles arriba, resultado abajo
Desktop: grid grid-cols-2 gap-12

Controles (izquierda):
  - Slider invitados: range 10–500 step 5 + número editable
  - 4 botones categoría: Clásicos · Con piquete · Kids · Infusiones
  - Toggle Morena/Splenda (oculto si Kids o Infusiones)
  - Checkboxes: incluir envío · incluir carrito

Resultado (derecha — card blanca):
  - Número grande: vitroleros() — text-8xl font-pacifico
  - Subtexto: "vitroleros sugeridos"
  - Rango: "Entre vitMin() y vitMax() según el consumo"
  - Pills: litros() litros · bebidas() bebidas de 550ml
  - Desglose de precio con total
  - Nota: "*Precio estimado, sujeto a disponibilidad de sabores"
  - Botón CTA: "Apartar con estos datos →" → ancla #aparta-fecha
    + pre-llena el formulario vía CalculadoraService

### Accesibilidad
- aria-label="Número de invitados" en el slider
- aria-live="polite" en el div de resultados
- role="status" en el precio total

## Formulario de contacto
Campos: nombre, fecha del evento, dirección, hora inicio, sabores (textarea), número de vasos
Submit → POST http://localhost:3000/api/orders
Reactive Forms con validación, errores inline bajo cada campo
El componente aparta-fecha inyecta CalculadoraService y usa effect()
para pre-llenar totalCups y categoria cuando viene desde la calculadora

## SEO
SSR activado para todas las rutas
Meta tags + Open Graph por página vía Meta y Title services
Objetivo Lighthouse: > 95

## Comandos
- npm run dev      → ng serve
- npm run lint     → ng lint
