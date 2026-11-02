import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  selector: 'app-menu-page',
  imports: [MenuComponent],
  template: `<main><app-menu /></main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuPageComponent {}
