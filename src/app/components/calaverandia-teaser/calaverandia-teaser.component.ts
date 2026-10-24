import {
  Component,
  ChangeDetectionStrategy,
  afterNextRender,
  inject,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-calaverandia-teaser',
  imports: [RouterLink],
  templateUrl: './calaverandia-teaser.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalaverandiaTeaserComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => {
        this.initAnimations();
      });
    });
  }

  private initAnimations() {
    // Pulso sutil en el badge de anuncio
    gsap.to('.cteaser-pulse', {
      scale: 1.08, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1,
    });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      gsap.killTweensOf('.cteaser-pulse');
    }
  }
}
