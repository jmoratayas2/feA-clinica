import { Component, Output, EventEmitter, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule }   from '@angular/material/list';
import { MatIconModule }   from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label:      string;
  icon:       string;
  route:      string;
  permission: string | null;  // null = siempre visible
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl:    './sidebar.component.css'
})
export class SidebarComponent {
  @Output() closeSidenav = new EventEmitter<void>();

  auth = inject(AuthService);

  /** Ítems del menú — permisos verificados contra PacienteController y CatalogosController */
  readonly navItems: NavItem[] = [
    { label: 'Inicio',         icon: 'home',           route: '/home',       permission: null },
    { label: 'Pacientes',      icon: 'people',          route: '/pacientes',  permission: 'PACIENTE_READ' },
    { label: 'Médicos',        icon: 'medical_services',route: '/medicos',    permission: 'MEDICO_READ' },
    { label: 'Clínicas',       icon: 'local_hospital',  route: '/clinicas',   permission: 'CLINICA_READ' },
    { label: 'Citas',          icon: 'event',           route: '/citas',      permission: 'CITA_READ' },
    { label: 'Consultas',      icon: 'assignment',      route: '/consultas',  permission: 'CONSULTA_READ' },
    { label: 'Especialidades', icon: 'school',          route: '/especialidades', permission: 'ESPECIALIDAD_READ' },
    { label: 'Medicamentos',   icon: 'medication',      route: '/medicamentos',   permission: 'MEDICAMENTO_READ' },
  ];

  /** Devuelve solo los ítems que el usuario tiene permiso de ver. */
  get visibleItems(): NavItem[] {
    return this.navItems.filter(item =>
      item.permission === null || this.auth.hasPermission(item.permission)
    );
  }
}
