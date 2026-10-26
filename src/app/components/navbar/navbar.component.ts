import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartSidebarService } from '../../services/cart-sidebar.service';

interface NavLink {
  path: string;
  label: string;
  labelLargo: string;
  icon: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:scroll)': 'onScroll()',
  },
})
export class NavbarComponent {
  readonly menuOpen = signal(false);
  readonly scrolled = signal(false);
  readonly sidebar  = inject(CartSidebarService);

  readonly links: NavLink[] = [
    { path: '/aguas',        label: 'Aguas',        labelLargo: 'Nuestras aguas',  icon: '🍹' },
    { path: '/menu',         label: 'Menú',         labelLargo: 'Menú y precios',  icon: '📋' },
    { path: '/experiencia',  label: 'Experiencia',  labelLargo: 'Experiencia',     icon: '✨' },
    { path: '/concentrados', label: 'Concentrados', labelLargo: 'Concentrados',    icon: '🫙' },
    { path: '/tienda', label: 'Comprar', labelLargo: 'Armar mi evento', icon: '🛍️' },
  ];

  toggleMenu() { this.menuOpen.update(v => !v); }
  closeMenu()  { this.menuOpen.set(false); }

  onScroll() { this.scrolled.set(window.scrollY > 24); }
}
