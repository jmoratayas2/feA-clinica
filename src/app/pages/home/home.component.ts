import { Component, inject } from '@angular/core';
import { MatCardModule }  from '@angular/material/card';
import { MatIconModule }  from '@angular/material/icon';
import { AuthService }    from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl:    './home.component.css'
})
export class HomeComponent {
  auth = inject(AuthService);

  readonly cards = [
    { icon: 'people',           label: 'Pacientes',     color: '#3F51B5', permission: 'PACIENTE_READ' },
    { icon: 'medical_services', label: 'Médicos',       color: '#009688', permission: 'MEDICO_READ' },
    { icon: 'local_hospital',   label: 'Clínicas',      color: '#F44336', permission: 'CLINICA_READ' },
    { icon: 'event',            label: 'Citas',         color: '#FF9800', permission: 'CITA_READ' },
    { icon: 'assignment',       label: 'Consultas',     color: '#9C27B0', permission: 'CONSULTA_READ' },
    { icon: 'school',           label: 'Especialidades',color: '#2196F3', permission: 'ESPECIALIDAD_READ' },
  ];

  get visibleCards() {
    return this.cards.filter(c => this.auth.hasPermission(c.permission));
  }
}
