import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Usuario } from '../../../models/usuario/usuario.model';
import { Rol } from '../../../models/rol/rol.model';
import { UsuarioService } from '../../../services/usuario.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RolPermisosDialogComponent } from '../rol-permisos-dialog/rol-permisos-dialog.component';

export interface UsuarioRolesDialogData {
  usuario: Usuario;
  todosRoles: Rol[];
}

@Component({
  selector: 'app-usuario-roles-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './usuario-roles-dialog.component.html',
  styleUrl: './usuario-roles-dialog.component.css'
})
export class UsuarioRolesDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<UsuarioRolesDialogComponent>);
  private usuarioService = inject(UsuarioService);
  private notify = inject(NotificationService);
  private dialog = inject(MatDialog);

  usuario!: Usuario;
  todosRoles: Rol[] = [];
  selectedRolId: number | null = null;
  loading = false;
  cambiosRealizados = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: UsuarioRolesDialogData) {
    this.usuario = { ...data.usuario };
    this.todosRoles = data.todosRoles;
  }

  ngOnInit(): void {}

  get rolesDisponiblesParaAsignar(): Rol[] {
    const rolesActuales = new Set(this.usuario.roles || []);
    return this.todosRoles.filter(r => !rolesActuales.has(r.nombre));
  }

  asignarAcceso(): void {
    if (!this.selectedRolId) return;

    const rol = this.todosRoles.find(r => r.idRol === this.selectedRolId);
    this.loading = true;

    this.usuarioService.asignarRol(this.usuario.idUsuario, this.selectedRolId).subscribe({
      next: (uActualizado) => {
        this.loading = false;
        this.usuario = uActualizado;
        this.selectedRolId = null;
        this.cambiosRealizados = true;
        this.notify.success('Acceso Asignado', `Se asignó el rol ${rol?.nombre} a ${this.usuario.username}`);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || 'No se pudo asignar el rol';
        this.notify.error('Error', msg);
      }
    });
  }

  async revocarAcceso(nombreRol: string): Promise<void> {
    const rol = this.todosRoles.find(r => r.nombre === nombreRol);
    if (!rol) return;

    const confirmado = await this.notify.confirm(
      '¿Revocar Acceso?',
      `¿Desea revocar el rol ${nombreRol} al usuario ${this.usuario.username}?`
    );
    if (!confirmado) return;

    this.loading = true;
    this.usuarioService.revocarRol(this.usuario.idUsuario, rol.idRol).subscribe({
      next: (uActualizado) => {
        this.loading = false;
        this.usuario = uActualizado;
        this.cambiosRealizados = true;
        this.notify.success('Acceso Revocado', `Se revocó el rol ${nombreRol}`);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || 'No se pudo revocar el rol';
        this.notify.error('Error', msg);
      }
    });
  }

  configurarPermisosRol(nombreRol: string): void {
    const rol = this.todosRoles.find(r => r.nombre === nombreRol);
    if (!rol) return;
    this.dialog.open(RolPermisosDialogComponent, {
      width: '820px',
      maxWidth: '96vw',
      data: { rol }
    });
  }

  cerrar(): void {
    this.dialogRef.close(this.cambiosRealizados ? this.usuario : null);
  }
}
