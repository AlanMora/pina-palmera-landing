import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  afterNextRender,
  OnDestroy,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { CalculadoraService, VitroleroLinea } from '../../services/calculadora.service';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-recover',
  imports: [RouterLink],
  templateUrl: './recover.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Recover implements OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private meta = inject(Meta);
  readonly cart = inject(CalculadoraService);
  readonly error = signal('');
  readonly loading = signal(true);
  readonly data = signal<{
    lines: VitroleroLinea[];
    guests: number;
    delivery: boolean;
    cart: boolean;
  } | null>(null);
  constructor() {
    this.meta.updateTag({ name: 'robots', content: 'noindex,nofollow' });
    this.meta.updateTag({ name: 'referrer', content: 'no-referrer' });
    afterNextRender(() => void this.load());
  }
  ngOnDestroy() {
    this.meta.removeTag('name="robots"');
    this.meta.removeTag('name="referrer"');
  }
  async load() {
    try {
      this.data.set(
        await firstValueFrom(
          this.http.get<{
            lines: VitroleroLinea[];
            guests: number;
            delivery: boolean;
            cart: boolean;
          }>(environment.apiUrl + '/shop/recover/' + this.route.snapshot.paramMap.get('token')),
        ),
      );
    } catch {
      this.error.set('El pedido no está disponible para recuperar. Puedes armar uno nuevo.');
    } finally {
      this.loading.set(false);
    }
  }
  async restore() {
    const d = this.data();
    if (!d) return;
    this.cart.lineas.set(
      d.lines.map((l) => ({
        id: crypto.randomUUID(),
        categoria: l.categoria,
        sabor: l.sabor,
        endulzante: l.endulzante,
      })),
    );
    this.cart.invitados.set(d.guests);
    this.cart.incluirEnvio.set(d.delivery);
    this.cart.incluirCarrito.set(d.cart);
    this.cart.catalog.load();
    await this.router.navigate(['/tienda']);
  }
}
