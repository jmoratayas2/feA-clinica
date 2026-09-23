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
        path: 'seguridad',
        redirectTo: 'seguridad/usuarios',
        pathMatch: 'full'
      },
      {
        path: 'usuarios',
        redirectTo: 'seguridad/usuarios',
        pathMatch: 'full'
      },
    ]
  },

  // ── Wildcard ──────────────────────────────────────────────────────────────
  { path: '**', redirectTo: 'home' }
];
