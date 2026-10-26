import {
  Component,
  ChangeDetectionStrategy,
  inject,
  effect,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { A11yModule } from '@angular/cdk/a11y';
import { LucideX, LucidePlus, LucideMinus, LucideShoppingBag } from '@lucide/angular';
import { CartSidebarService } from '../../services/cart-sidebar.service';
import { CalculadoraService } from '../../services/calculadora.service';
@Component({
  selector: 'app-cart-sidebar',
  imports: [RouterLink, A11yModule, LucideX, LucidePlus, LucideMinus, LucideShoppingBag],
  templateUrl: './cart-sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSidebarComponent implements OnDestroy {
  readonly sidebar = inject(CartSidebarService);
  readonly calc = inject(CalculadoraService);
  private platform = inject(PLATFORM_ID);
  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platform))
        document.body.style.overflow = this.sidebar.isOpen() ? 'hidden' : '';
    });
  }
  ngOnDestroy() {
    if (isPlatformBrowser(this.platform)) document.body.style.overflow = '';
  }
}
