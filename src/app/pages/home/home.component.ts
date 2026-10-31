import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule }  from '@angular/material/card';
import { MatIconModule }  from '@angular/material/icon';
import { AuthService }    from '../../core/services/auth.service';

interface ModuleCard {
  icon: string;
  label: string;
  route: string;
  color: string;
  permission: string;
  description?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, MatCardModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl:    './home.component.css'
})
export class HomeComponent {
  auth   = inject(AuthService);
  router = inject(Router);

  readonly cards: ModuleCard[] = [
    { icon: 'people',                label: 'Pacientes',         route: '/pacientes',          color: '#3F51B5', permission: 'PACIENTE_READ' },
    { icon: 'event',                 label: 'Citas Médicas',     route: '/citas',              color: '#FF9800', permission: 'CITA_READ' },
    { icon: 'assignment',            label: 'Consultas',         route: '/consultas',          color: '#9C27B0', permission: 'CONSULTA_READ' },
    { icon: 'medical_services',      label: 'Médicos',           route: '/medicos',            color: '#009688', permission: 'MEDICO_READ' },
    { icon: 'school',                label: 'Especialidades',    route: '/especialidades',     color: '#2196F3', permission: 'ESPECIALIDAD_READ' },
    { icon: 'medication',            label: 'Medicamentos',      route: '/medicamentos',       color: '#E91E63', permission: 'MEDICAMENTO_READ' },
    { icon: 'biotech',               label: 'Exámenes Lab',      route: '/examenes',           color: '#00BCD4', permission: 'EXAMEN_READ' },
    { icon: 'local_hospital',        label: 'Clínicas',          route: '/clinicas',           color: '#F44336', permission: 'CLINICA_READ' },
    { icon: 'manage_accounts',       label: 'Usuarios',          route: '/seguridad/usuarios', color: '#4CAF50', permission: 'USUARIO_READ' },
    { icon: 'admin_panel_settings',  label: 'Roles y Permisos',  route: '/seguridad/roles',    color: '#795548', permission: 'ROL_READ' },
    { icon: 'bar_chart',             label: 'Reportes',          route: '/reportes',           color: '#607D8B', permission: 'PACIENTE_READ' },
  ];

  get visibleCards(): ModuleCard[] {
    return this.cards.filter(c => this.auth.hasPermission(c.permission));
  }

  navigateTo(route: string): void {
    if (route) {
      this.router.navigate([route]);
    }
  }
}
