import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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

import { RolService, RolRequest } from '../../../services/rol.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Rol } from '../../../models/rol/rol.model';
import { RolFormDialogComponent } from '../rol-form-dialog/rol-form-dialog.component';
import { RolPermisosDialogComponent } from '../rol-permisos-dialog/rol-permisos-dialog.component';

@Component({
  selector: 'app-rol-list',
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
  template: `
    <div class="page-container">
      <mat-card class="header-card">
        <div class="header-content">
          <div>
            <h1 class="page-title">Roles de Seguridad</h1>
            <p class="page-subtitle">Perfiles de acceso y permisos RBAC para el sistema clínico</p>
          </div>
          <button
            mat-raised-button
            color="primary"
            *ngIf="auth.hasPermission('ROL_CREATE')"
            (click)="abrirModalCrear()"
          >
            <mat-icon>add_moderator</mat-icon> Nuevo Rol
          </button>
        </div>
      </mat-card>

      <mat-card class="content-card">
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar rol</mat-label>
            <input matInput [(ngModel)]="filtro" placeholder="Filtrar por nombre o descripción...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <span class="total-badge">{{ rolesFiltrados.length }} roles</span>
        </div>

        <div *ngIf="loading" class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando perfiles y roles de seguridad...</p>
        </div>

        <div class="table-container" *ngIf="!loading">
          <table mat-table [dataSource]="rolesFiltrados" class="mat-elevation-z1 app-table">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef style="width: 70px">#</th>
              <td mat-cell *matCellDef="let r">{{ r.idRol }}</td>
            </ng-container>

            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef>Rol de Seguridad</th>
              <td mat-cell *matCellDef="let r">
                <div class="font-semibold">{{ r.nombre }}</div>
                <div class="text-xs text-muted" *ngIf="r.nombreSistema">
                  Sistema: {{ r.nombreSistema }}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="descripcion">
              <th mat-header-cell *matHeaderCellDef>Descripción</th>
              <td mat-cell *matCellDef="let r">{{ r.descripcion || 'Sin descripción' }}</td>
            </ng-container>

            <ng-container matColumnDef="activo">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let r">
                <mat-chip [class.active-chip]="r.activo" [class.inactive-chip]="!r.activo" highlighted>
                  {{ r.activo ? 'ACTIVO' : 'INACTIVO' }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let r" class="actions-cell">
                <button
                  mat-icon-button
                  color="accent"
                  matTooltip="Configurar acciones y permisos (Ver, Editar, Crear...)"
                  *ngIf="auth.hasPermission('ROL_UPDATE')"
                  (click)="abrirModalPermisos(r)"
                >
                  <mat-icon>tune</mat-icon>
                </button>

                <button
                  mat-icon-button
                  color="primary"
                  matTooltip="Editar"
                  *ngIf="auth.hasPermission('ROL_UPDATE')"
                  (click)="abrirModalEditar(r)"
                >
                  <mat-icon>edit</mat-icon>
                </button>

                <button
                  mat-icon-button
                  [color]="r.activo ? 'warn' : 'accent'"
                  [matTooltip]="r.activo ? 'Desactivar rol' : 'Activar rol'"
                  *ngIf="auth.hasPermission('ROL_UPDATE')"
                  (click)="toggleEstado(r)"
                >
                  <mat-icon>{{ r.activo ? 'block' : 'check_circle' }}</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell empty-state" [attr.colspan]="displayedColumns.length">
                No se encontraron roles de seguridad registrados.
              </td>
            </tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .header-card {
      padding: 24px;
      border-radius: 12px;
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: #ffffff;
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 6px 0;
      color: #ffffff;
    }
    .page-subtitle {
      margin: 0;
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.85);
    }
    .content-card {
      padding: 20px;
      border-radius: 12px;
    }
    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .search-field {
      width: 360px;
    }
    .total-badge {
      font-size: 0.875rem;
      font-weight: 600;
      color: #64748b;
      background: #f1f5f9;
      padding: 6px 12px;
      border-radius: 20px;
    }
    .table-container {
      overflow-x: auto;
    }
    .app-table {
      width: 100%;
    }
    .font-semibold {
      font-weight: 600;
      color: #1e293b;
    }
    .text-xs {
      font-size: 0.75rem;
    }
    .text-muted {
      color: #64748b;
    }
    .active-chip {
      background-color: #dcfce7 !important;
      color: #166534 !important;
    }
    .inactive-chip {
      background-color: #fee2e2 !important;
      color: #991b1b !important;
    }
    .actions-cell {
      white-space: nowrap;
    }
    .loading-state, .empty-state {
      text-align: center;
      padding: 40px;
      color: #64748b;
    }
  `]
})
export class RolListComponent implements OnInit {
  private service = inject(RolService);
  auth = inject(AuthService);
  private notify = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  roles: Rol[] = [];
  filtro = '';
  loading = true;

  readonly displayedColumns: string[] = [
    'id',
    'nombre',
    'descripcion',
    'activo',
    'acciones'
  ];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.service.listar().subscribe({
      next: (res) => {
        this.roles = res;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.notify.error('Error al cargar roles', err.error?.message || err.message);
        this.cdr.markForCheck();
      }
    });
  }

  get rolesFiltrados(): Rol[] {
    if (!this.filtro.trim()) return this.roles;
    const term = this.filtro.toLowerCase().trim();
    return this.roles.filter(r =>
      r.nombre.toLowerCase().includes(term) ||
      (r.descripcion && r.descripcion.toLowerCase().includes(term))
    );
  }

  abrirModalCrear(): void {
    const ref = this.dialog.open(RolFormDialogComponent, {
      width: '500px',
      data: { rol: null }
    });

    ref.afterClosed().subscribe((req: RolRequest) => {
      if (!req) return;
      this.service.crear(req).subscribe({
        next: () => {
          this.notify.success('Rol creado con éxito');
          this.cargarDatos();
        },
        error: (err) => this.notify.error('Error al crear rol', err.error?.message || err.message)
      });
    });
  }

  abrirModalEditar(r: Rol): void {
    const ref = this.dialog.open(RolFormDialogComponent, {
      width: '500px',
      data: { rol: r }
    });

    ref.afterClosed().subscribe((req: RolRequest) => {
      if (!req || !r.idRol) return;
      this.service.actualizar(r.idRol, req).subscribe({
        next: () => {
          this.notify.success('Rol actualizado con éxito');
          this.cargarDatos();
        },
        error: (err) => this.notify.error('Error al actualizar rol', err.error?.message || err.message)
      });
    });
  }

  abrirModalPermisos(r: Rol): void {
    const ref = this.dialog.open(RolPermisosDialogComponent, {
      width: '820px',
      maxWidth: '96vw',
      data: { rol: r }
    });

    ref.afterClosed().subscribe((guardado) => {
      if (guardado) {
        this.cargarDatos();
      }
    });
  }

  toggleEstado(r: Rol): void {
    if (!r.idRol) return;
    const nuevoEstado = !r.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    this.notify.confirm(
      `¿Desea ${accion} el rol "${r.nombre}"?`,
      `El registro pasará a estar ${nuevoEstado ? 'activo' : 'inactivo'}.`
    ).then((confirmado) => {
      if (!confirmado) return;
      this.service.cambiarEstado(r.idRol, nuevoEstado).subscribe({
        next: () => {
          this.notify.success(`Rol ${accion}do con éxito`);
          this.cargarDatos();
        },
        error: (err) => this.notify.error(`Error al ${accion} rol`, err.error?.message || err.message)
      });
    });
  }
}
