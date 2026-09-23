import { Component, Output, EventEmitter, inject, OnInit, signal, effect } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule }   from '@angular/material/list';
import { MatIconModule }   from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../core/services/auth.service';
import { MenuService } from '../../core/services/menu.service';
import { MenuModulo } from '../../models/menu/menu-modulo.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl:    './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  @Output() closeSidenav = new EventEmitter<void>();

  auth = inject(AuthService);
  private menuService = inject(MenuService);

  /** Módulos obtenidos dinámicamente desde el backend según los accesos del usuario */
  menuItems = signal<MenuModulo[]>([]);

  /** Control de expansión de módulos padre con hijos */
  expandedModulos = signal<Record<number, boolean>>({});

  constructor() {
    // Reaccionar automáticamente cuando el usuario inicie o cierre sesión
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.cargarMenu();
      } else {
        this.menuItems.set([]);
      }
    });
  }

  ngOnInit(): void {
    this.cargarMenu();
  }

  cargarMenu(): void {
    if (!this.auth.isAuthenticated()) return;

    this.menuService.getMenu().subscribe({
      next: (modulos) => {
        this.menuItems.set(modulos);
        // Expandir por defecto módulos con hijos
        const expandMap: Record<number, boolean> = {};
        modulos.forEach(m => {
          if (m.submodulos && m.submodulos.length > 0) {
            expandMap[m.idModulo] = true;
          }
        });
        this.expandedModulos.set(expandMap);
      },
      error: (err) => {
        console.error('Error al obtener módulos del menú:', err);
      }
    });
  }

  toggleExpand(idModulo: number): void {
    const current = this.expandedModulos();
    this.expandedModulos.set({
      ...current,
      [idModulo]: !current[idModulo]
    });
  }

  isExpanded(idModulo: number): boolean {
    return !!this.expandedModulos()[idModulo];
  }
}
