import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowDown,
  LucideArrowRight,
  LucideDroplets,
  LucideGlassWater,
  LucideLeaf,
  LucideSparkles,
} from '@lucide/angular';

@Component({
  selector: 'app-menu-hero',
  imports: [
    RouterLink,
    LucideArrowDown,
    LucideArrowRight,
    LucideDroplets,
    LucideGlassWater,
    LucideLeaf,
    LucideSparkles,
  ],
  templateUrl: './menu-hero.component.html',
  styleUrl: './menu-hero.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuHeroComponent {}
