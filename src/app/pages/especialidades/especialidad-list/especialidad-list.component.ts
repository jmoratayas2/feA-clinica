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

import { CatalogosService } from '../../../services/catalogos.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Especialidad, EspecialidadRequest } from '../../../models/especialidad/especialidad.model';
import { EspecialidadFormDialogComponent } from '../especialidad-form-dialog/especialidad-form-dialog.component';

@Component({
  selector: 'app-especialidad-list',
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
            <h1 class="page-title">Catálogo de Especialidades Médicas</h1>
            <p class="page-subtitle">Ramas y disciplinas clínicas registradas en el sistema</p>
          </div>
          <button
            mat-raised-button
            color="primary"
            *ngIf="auth.hasPermission('ESPECIALIDAD_CREATE')"
            (click)="abrirModalCrear()"
          >
            <mat-icon>school</mat-icon> Nueva Especialidad
          </button>
        </div>
      </mat-card>

      <mat-card class="content-card">
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar especialidad</mat-label>
            <input matInput [(ngModel)]="filtro" placeholder="Filtrar por nombre o descripción...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <span class="total-badge">{{ especialidadesFiltradas.length }} especialidades</span>
        </div>

        <div *ngIf="loading" class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando especialidades...</p>
        </div>

        <div class="table-container" *ngIf="!loading">
          <table mat-table [dataSource]="especialidadesFiltradas" class="mat-elevation-z1 app-table">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef style="width: 70px">#</th>
              <td mat-cell *matCellDef="let e">{{ e.id }}</td>
            </ng-container>

            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let e">
                <span class="font-semibold">{{ e.nombre }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="descripcion">
              <th mat-header-cell *matHeaderCellDef>Descripción</th>
              <td mat-cell *matCellDef="let e">{{ e.descripcion || 'Sin descripción' }}</td>
            </ng-container>

            <ng-container matColumnDef="activo">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let e">
                <mat-chip [class.active-chip]="e.activo" [class.inactive-chip]="!e.activo" highlighted>
                  {{ e.activo ? 'ACTIVO' : 'INACTIVO' }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let e" class="actions-cell">
                <button
                  mat-icon-button
                  color="primary"
                  matTooltip="Editar"
                  *ngIf="auth.hasPermission('ESPECIALIDAD_UPDATE')"
                  (click)="abrirModalEditar(e)"
                >
                  <mat-icon>edit</mat-icon>
                </button>

                <button
                  mat-icon-button
                  [color]="e.activo ? 'warn' : 'accent'"
                  [matTooltip]="e.activo ? 'Desactivar especialidad' : 'Activar especialidad'"
                  *ngIf="auth.hasPermission('ESPECIALIDAD_UPDATE')"
                  (click)="toggleEstado(e)"
                >
                  <mat-icon>{{ e.activo ? 'block' : 'check_circle' }}</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell empty-state" [attr.colspan]="displayedColumns.length">
                No se encontraron especialidades registradas.
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
export class EspecialidadListComponent implements OnInit {
  private service = inject(CatalogosService);
  auth = inject(AuthService);
  private notify = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  especialidades: Especialidad[] = [];
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
    this.service.listarEspecialidades(true).subscribe({
      next: (res) => {
        this.especialidades = res;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.notify.error('Error al cargar especialidades', err.error?.message || err.message);
        this.cdr.markForCheck();
      }
    });
  }

  get especialidadesFiltradas(): Especialidad[] {
    if (!this.filtro.trim()) return this.especialidades;
    const term = this.filtro.toLowerCase().trim();
    return this.especialidades.filter(e =>
      e.nombre.toLowerCase().includes(term) ||
      (e.descripcion && e.descripcion.toLowerCase().includes(term))
    );
  }

  abrirModalCrear(): void {
    const ref = this.dialog.open(EspecialidadFormDialogComponent, {
      width: '500px',
      data: { especialidad: null }
    });

    ref.afterClosed().subscribe((req: EspecialidadRequest) => {
      if (!req) return;
      this.service.crearEspecialidad(req).subscribe({
        next: () => {
          this.notify.success('Especialidad creada con éxito');
          this.cargarDatos();
        },
        error: (err) => this.notify.error('Error al crear especialidad', err.error?.message || err.message)
      });
    });
  }

  abrirModalEditar(e: Especialidad): void {
    const ref = this.dialog.open(EspecialidadFormDialogComponent, {
      width: '500px',
      data: { especialidad: e }
    });

    ref.afterClosed().subscribe((req: EspecialidadRequest) => {
      if (!req || !e.id) return;
      this.service.actualizarEspecialidad(e.id, req).subscribe({
        next: () => {
          this.notify.success('Especialidad actualizada con éxito');
          this.cargarDatos();
        },
        error: (err) => this.notify.error('Error al actualizar especialidad', err.error?.message || err.message)
      });
    });
  }

  toggleEstado(e: Especialidad): void {
    if (!e.id) return;
    const accion = e.activo ? 'desactivar' : 'activar';
    this.notify.confirm(
      `¿Desea ${accion} la especialidad "${e.nombre}"?`,
      `El registro pasará a estar ${e.activo ? 'inactivo' : 'activo'}.`
    ).then((confirmado) => {
      if (!confirmado) return;
      const obs = e.activo
        ? this.service.desactivarEspecialidad(e.id!)
        : this.service.activarEspecialidad(e.id!);

      obs.subscribe({
        next: () => {
          this.notify.success(`Especialidad ${accion}da con éxito`);
          this.cargarDatos();
        },
        error: (err) => this.notify.error(`Error al ${accion} especialidad`, err.error?.message || err.message)
      });
    });
  }
}
