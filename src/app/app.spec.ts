import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Catalog } from './services/catalog';
import { CalculadoraService } from './services/calculadora.service';
import { environment } from '../environments/environment';

describe('Catálogo y cotización pública', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('bloquea pedidos sin catálogo y calcula con los precios recibidos, incluidos centavos', () => {
    const calc = TestBed.inject(CalculadoraService);
    expect(calc.pedidoValido()).toBe(false);
    expect(calc.lineasPedido()).toHaveLength(0);
    calc.catalog.load();
    TestBed.inject(HttpTestingController)
      .expectOne(environment.apiUrl + '/catalog')
      .flush({
        categories: [
          {
            id: 'clasicos',
            name: 'Clásicos',
            emoji: '🍹',
            priceMorena: 76550,
            priceSplenda: null,
            flavors: ['Jamaica'],
            available: true,
          },
        ],
        settings: {
          shippingCents: 27025,
          cartCents: 35000,
          depositPercent: 50,
          bankName: '',
          bankHolder: '',
          bankClabe: '',
        },
      });
    expect(calc.pedidoValido()).toBe(false);
    calc.agregarLineasSugeridas();
    expect(calc.pedidoValido()).toBe(true);
    expect(calc.lineasPedido().every((l) => l.sabor === 'Jamaica')).toBe(true);
    calc.incluirEnvio.set(true);
    expect(calc.precioTotal()).toBe(4 * 765.5 + 270.25);
    calc.agregarLinea();
    calc.actualizarLinea(calc.lineas()[0].id, { endulzante: 'splenda' });
    expect(calc.pedidoValido()).toBe(false);
  });
  it('no usa precios anteriores cuando falla la recarga', () => {
    const catalog = TestBed.inject(Catalog);
    catalog.load();
    TestBed.inject(HttpTestingController)
      .expectOne(environment.apiUrl + '/catalog')
      .flush({}, { status: 503, statusText: 'Unavailable' });
    expect(catalog.data()).toBeNull();
    expect(catalog.error()).toBeTruthy();
    expect(catalog.money(NaN)).toBe('Por consultar');
  });
});
