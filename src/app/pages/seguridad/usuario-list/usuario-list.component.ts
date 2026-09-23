import {
  Component, OnInit, inject, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { UsuarioService } from '../../../services/usuario.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Usuario, UsuarioRequest } from '../../../models/usuario/usuario.model';
import { Rol } from '../../../models/rol/rol.model';
import { UsuarioFormDialogComponent } from '../usuario-form-dialog/usuario-form-dialog.component';
import { UsuarioRolesDialogComponent } from '../usuario-roles-dialog/usuario-roles-dialog.component';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule
  ],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.css'
})
export class UsuarioListComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  auth = inject(AuthService);
  private notify = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  usuarios: Usuario[] = [];
  rolesDisponibles: Rol[] = [];
  filtro = '';
  loading = true;

  readonly displayedColumns: string[] = [
    'idUsuario',
    'username',
    'nombreCompleto',
    'email',
    'roles',
    'activo',
    'acciones'
  ];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.usuarioService.listarRoles().subscribe({
      next: (roles) => {
        this.rolesDisponibles = roles;
      },
      error: (err) => console.error('Error al cargar roles', err)
    });

    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.notify.error('Error al cargar usuarios', err.error?.message || err.message);
        this.cdr.markForCheck();
      }
    });
  }

  get usuariosFiltrados(): Usuario[] {
    if (!this.filtro.trim()) return this.usuarios;
    const term = this.filtro.toLowerCase().trim();
    return this.usuarios.filter(u =>
      u.username.toLowerCase().includes(term) ||
      (u.nombres && u.nombres.toLowerCase().includes(term)) ||
      (u.apellidos && u.apellidos.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      u.roles.some(r => r.toLowerCase().includes(term))
    );
  }

  abrirDialogoCrear(): void {
    const dialogRef = this.dialog.open(UsuarioFormDialogComponent, {
      width: '560px',
      data: {
        usuario: null,
        rolesDisponibles: this.rolesDisponibles
      }
    });

    dialogRef.afterClosed().subscribe((res: { request: UsuarioRequest; initialRolId?: number } | undefined) => {
      if (!res) return;

      this.loading = true;
      this.usuarioService.crear(res.request).subscribe({
        next: (nuevoUsuario) => {
          if (res.initialRolId) {
            // Asignar rol inicial
            this.usuarioService.asignarRol(nuevoUsuario.idUsuario, res.initialRolId).subscribe({
              next: () => {
                this.notify.success('Usuario Creado', `Usuario @${nuevoUsuario.username} creado exitosamente con su rol inicial.`);
                this.cargarDatos();
              },
              error: () => {
                this.notify.warning('Usuario Creado', `Usuario creado pero ocurrió un detalle al asignar el rol.`);
                this.cargarDatos();
              }
            });
          } else {
            this.notify.success('Usuario Creado', `Usuario @${nuevoUsuario.username} creado exitosamente.`);
            this.cargarDatos();
          }
        },
        error: (err) => {
          this.loading = false;
          const msg = err.error?.message || 'No se pudo crear el usuario';
          this.notify.error('Error al Crear Usuario', msg);
          this.cdr.markForCheck();
        }
      });
    });
  }

  abrirDialogoEditar(usuario: Usuario): void {
    const dialogRef = this.dialog.open(UsuarioFormDialogComponent, {
      width: '560px',
      data: {
        usuario,
        rolesDisponibles: this.rolesDisponibles
      }
    });

    dialogRef.afterClosed().subscribe((res: { request: UsuarioRequest } | undefined) => {
      if (!res) return;

      this.loading = true;
      this.usuarioService.actualizar(usuario.idUsuario, res.request).subscribe({
        next: () => {
          this.notify.success('Usuario Actualizado', `Datos del usuario @${usuario.username} actualizados.`);
          this.cargarDatos();
        },
        error: (err) => {
          this.loading = false;
          const msg = err.error?.message || 'No se pudo actualizar el usuario';
          this.notify.error('Error al Actualizar', msg);
          this.cdr.markForCheck();
        }
      });
    });
  }

  abrirDialogoAccesos(usuario: Usuario): void {
    const dialogRef = this.dialog.open(UsuarioRolesDialogComponent, {
      width: '600px',
      data: {
        usuario,
        todosRoles: this.rolesDisponibles
      }
    });

    dialogRef.afterClosed().subscribe((usuarioActualizado: Usuario | null) => {
      if (usuarioActualizado) {
        this.cargarDatos();
      }
    });
  }

  async toggleEstado(usuario: Usuario): Promise<void> {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    const confirmado = await this.notify.confirm(
      `¿Desea ${accion} usuario?`,
      `El usuario @${usuario.username} ${usuario.activo ? 'ya no podrá iniciar sesión' : 'podrá volver a iniciar sesión'}.`
    );
    if (!confirmado) return;

    this.loading = true;
    this.usuarioService.cambiarEstado(usuario.idUsuario, !usuario.activo).subscribe({
      next: () => {
        this.notify.success('Estado Actualizado', `Usuario @${usuario.username} ${!usuario.activo ? 'activado' : 'desactivado'}.`);
        this.cargarDatos();
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || 'Error al cambiar estado';
        this.notify.error('Error', msg);
        this.cdr.markForCheck();
      }
    });
  }

  getRoleClass(rol: string): string {
    switch (rol.toUpperCase()) {
      case 'ADMINISTRADOR': return 'chip-admin';
      case 'MEDICO':        return 'chip-medico';
      case 'RECEPCIONISTA': return 'chip-recepcion';
      case 'ENFERMERIA':    return 'chip-enfermeria';
      case 'LABORATORIO':   return 'chip-lab';
      case 'AUDITOR':       return 'chip-auditor';
      default:              return 'chip-default';
    }
  }
}
