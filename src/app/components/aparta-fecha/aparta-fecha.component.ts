import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  effect,
  afterNextRender,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CalculadoraService } from '../../services/calculadora.service';
import { ContactService } from '../../services/contact.service';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-aparta-fecha',
  imports: [ReactiveFormsModule],
  templateUrl: './aparta-fecha.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApartaFechaComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly calc = inject(CalculadoraService);
  private readonly contact = inject(ContactService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly enviando = signal(false);
  readonly enviado = signal(false);
  readonly error = signal('');

  readonly form = this.fb.group({
    nombre:     ['', [Validators.required, Validators.minLength(2)]],
    fecha:      ['', Validators.required],
    direccion:  ['', Validators.required],
    hora:       ['', Validators.required],
    sabores:    [''],
    vasos:      [''],
    invitados:  [0],
    vitroleros: [0],
    categoria:  [''],
    totalCups:  [0],
    endulzante: [''],
    servicioEntrega: [''],
    incluirEnvio: [false],
    incluirCarrito: [false],
    precioBase:  [0],
    precioTotal: [0],
    notas:      [''],
  });

  constructor() {
    effect(() => {
      const datos = this.calc.datosFormulario();
      this.form.patchValue({
        invitados:  datos.invitados,
        totalCups:  datos.totalCups,
        categoria:  datos.categoria,
        vitroleros: datos.vitroleros,
        endulzante: datos.endulzante,
        servicioEntrega: datos.servicioEntrega,
        incluirEnvio: datos.incluirEnvio,
        incluirCarrito: datos.incluirCarrito,
        precioBase: datos.precioBase,
        precioTotal: datos.precioTotal,
      });
    });

    afterNextRender(() => {
      requestAnimationFrame(() => {
        this.initAnimations();
      });
    });
  }

  private initAnimations() {
    gsap.from('.form-section .section-title', {
      scrollTrigger: { trigger: '.form-section .section-title', start: 'top 85%' },
      duration: 0.8, y: 50, opacity: 0, ease: 'power2.out',
    });
    gsap.from('.form-field', {
      scrollTrigger: { trigger: '.form-section', start: 'top 75%' },
      duration: 0.5, x: -40, opacity: 0, ease: 'power2.out', stagger: 0.08,
    });
    gsap.from('.transfer-card', {
      scrollTrigger: { trigger: '.transfer-card', start: 'top 80%' },
      duration: 0.7, x: 50, opacity: 0, ease: 'power2.out',
    });
  }

  get f() { return this.form.controls; }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  formatPrice(value: number | null | undefined): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(value ?? 0);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set('');
    const val = this.form.value;
    this.contact.submitOrder({
      nombre:     val.nombre ?? '',
      fecha:      val.fecha ?? '',
      direccion:  val.direccion ?? '',
      hora:       val.hora ?? '',
      sabores:    val.sabores ?? '',
      vasos:      val.vasos ?? '',
      invitados:  val.invitados ?? 0,
      vitroleros: val.vitroleros ?? 0,
      categoria:  val.categoria ?? '',
      totalCups:  val.totalCups ?? 0,
      endulzante: val.endulzante ?? '',
      notas:      val.notas ?? '',
      servicioEntrega: val.servicioEntrega ?? '',
      incluirEnvio: val.incluirEnvio ?? false,
      incluirCarrito: val.incluirCarrito ?? false,
      precioBase:  val.precioBase ?? 0,
      precioTotal: val.precioTotal ?? 0,
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.enviado.set(true);
        this.form.reset();
      },
      error: () => {
        this.enviando.set(false);
        this.error.set('Hubo un error al enviar. Por favor contáctanos por teléfono: 33 1804 1630');
      },
    });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      ScrollTrigger.getAll().forEach(t => t.kill());
      gsap.killTweensOf('*');
    }
  }
}
