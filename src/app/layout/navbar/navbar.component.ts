import { Component, Output, EventEmitter, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule }  from '@angular/material/button';
import { MatIconModule }    from '@angular/material/icon';
import { MatMenuModule }    from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService }         from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl:    './navbar.component.css'
})
export class NavbarComponent {
  @Output() menuToggle = new EventEmitter<void>();

  auth   = inject(AuthService);
  notify = inject(NotificationService);
  router = inject(Router);

  async onLogout(): Promise<void> {
    const ok = await this.notify.confirm(
      '¿Cerrar sesión?',
      '¿Desea salir del sistema?'
    );
    if (ok) {
      this.auth.logout();
    }
  }
}
