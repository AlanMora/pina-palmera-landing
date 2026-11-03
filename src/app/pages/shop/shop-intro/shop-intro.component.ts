import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideShoppingBag, LucideGlassWater, LucideArrowRight } from '@lucide/angular';

@Component({
  selector: 'app-shop-intro',
  imports: [RouterLink, LucideShoppingBag, LucideGlassWater, LucideArrowRight],
  templateUrl: './shop-intro.component.html',
  styleUrl: './shop-intro.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopIntroComponent {}
