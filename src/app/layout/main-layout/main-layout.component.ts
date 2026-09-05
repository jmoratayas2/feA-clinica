import { Component, ViewChild, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { NavbarComponent }  from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    NavbarComponent,
    SidebarComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl:    './main-layout.component.css'
})
export class MainLayoutComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  private breakpoint = inject(BreakpointObserver);

  isHandset = toSignal(
    this.breakpoint.observe([Breakpoints.Handset, Breakpoints.Tablet])
      .pipe(map(r => r.matches)),
    { initialValue: false }
  );

  toggleSidenav(): void {
    this.sidenav.toggle();
  }
}
