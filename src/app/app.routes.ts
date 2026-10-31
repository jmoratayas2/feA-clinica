import { Routes } from '@angular/router';
import { authGuard }       from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [

  // ── Ruta raíz: redirige según autenticación ──────────────────────────────
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // ── Login (público) ───────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },

  // ── Unauthorized ──────────────────────────────────────────────────────────
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },

  // ── Layout principal (requiere autenticación) ────────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [

      // Home
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then(m => m.HomeComponent)
      },

      // Pacientes
      {
        path: 'pacientes',
        canActivate: [permissionGuard],
        data: { permission: 'PACIENTE_READ' },
        loadComponent: () =>
          import('./pages/pacientes/paciente-list/paciente-list.component').then(m => m.PacienteListComponent)
      },
      {
        path: 'pacientes/nuevo',
        canActivate: [permissionGuard],
        data: { permission: 'PACIENTE_CREATE' },
        loadComponent: () =>
          import('./pages/pacientes/paciente-form/paciente-form.component').then(m => m.PacienteFormComponent)
      },
      {
        path: 'pacientes/:id',
        canActivate: [permissionGuard],
        data: { permission: 'PACIENTE_READ' },
        loadComponent: () =>
          import('./pages/pacientes/paciente-detail/paciente-detail.component').then(m => m.PacienteDetailComponent)
      },
      {
        path: 'pacientes/:id/editar',
        canActivate: [permissionGuard],
        data: { permission: 'PACIENTE_UPDATE' },
        loadComponent: () =>
          import('./pages/pacientes/paciente-form/paciente-form.component').then(m => m.PacienteFormComponent)
      },

      // Seguridad - Gestión de Usuarios y Accesos
      {
        path: 'seguridad/usuarios',
        canActivate: [permissionGuard],
        data: { permission: 'USUARIO_READ' },
        loadComponent: () =>
          import('./pages/seguridad/usuario-list/usuario-list.component').then(m => m.UsuarioListComponent)
      },
      {
        path: 'seguridad/roles',
        canActivate: [permissionGuard],
        data: { permission: 'ROL_READ' },
        loadComponent: () =>
          import('./pages/seguridad/rol-list/rol-list.component').then(m => m.RolListComponent)
      },
      {
        path: 'seguridad',
        redirectTo: 'seguridad/usuarios',
        pathMatch: 'full'
      },
      {
        path: 'usuarios',
        redirectTo: 'seguridad/usuarios',
        pathMatch: 'full'
      },

      // Clínicas
      {
        path: 'clinicas',
        canActivate: [permissionGuard],
        data: { permission: 'CLINICA_READ' },
        loadComponent: () =>
          import('./pages/clinicas/clinica-list/clinica-list.component').then(m => m.ClinicaListComponent)
      },

      // Médicos y Especialidades
      {
        path: 'medicos',
        canActivate: [permissionGuard],
        data: { permission: 'MEDICO_READ' },
        loadComponent: () =>
          import('./pages/medicos/medico-list/medico-list.component').then(m => m.MedicoListComponent)
      },
      {
        path: 'especialidades',
        canActivate: [permissionGuard],
        data: { permission: 'ESPECIALIDAD_READ' },
        loadComponent: () =>
          import('./pages/especialidades/especialidad-list/especialidad-list.component').then(m => m.EspecialidadListComponent)
      },

      // Medicamentos
      {
        path: 'medicamentos',
        canActivate: [permissionGuard],
        data: { permission: 'MEDICAMENTO_READ' },
        loadComponent: () =>
          import('./pages/medicamentos/medicamento-list/medicamento-list.component').then(m => m.MedicamentoListComponent)
      },

      // Citas
      {
        path: 'citas',
        canActivate: [permissionGuard],
        data: { permission: 'CITA_READ' },
        loadComponent: () =>
          import('./pages/citas/cita-list/cita-list.component').then(m => m.CitaListComponent)
      },

      // Consultas
      {
        path: 'consultas',
        canActivate: [permissionGuard],
        data: { permission: 'CONSULTA_READ' },
        loadComponent: () =>
          import('./pages/consultas/consulta-list/consulta-list.component').then(m => m.ConsultaListComponent)
      },

      // Laboratorio y Exámenes
      {
        path: 'examenes',
        canActivate: [permissionGuard],
        data: { permission: 'EXAMEN_READ' },
        loadComponent: () =>
          import('./pages/examenes/examen-list/examen-list.component').then(m => m.ExamenListComponent)
      },

      // Reportes y Estadísticas
      {
        path: 'reportes',
        canActivate: [permissionGuard],
        data: { permission: 'PACIENTE_READ' },
        loadComponent: () =>
          import('./pages/reportes/reportes.component').then(m => m.ReportesComponent)
      }
    ]
  },

  // ── Wildcard ──────────────────────────────────────────────────────────────
  { path: '**', redirectTo: 'home' }
];
