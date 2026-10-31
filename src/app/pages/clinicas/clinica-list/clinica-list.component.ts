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
import { Clinica, ClinicaRequest } from '../../../models/clinica/clinica.model';
import { ClinicaFormDialogComponent } from '../clinica-form-dialog/clinica-form-dialog.component';

@Component({
  selector: 'app-clinica-list',
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
            <h1 class="page-title">Gestión de Clínicas</h1>
            <p class="page-subtitle">Sedes y centros médicos habilitados para la atención de pacientes</p>
          </div>
          <button
            mat-raised-button
            color="primary"
            *ngIf="auth.hasPermission('CLINICA_CREATE')"
            (click)="abrirModalCrear()"
          >
            <mat-icon>add_business</mat-icon> Nueva Clínica
          </button>
        </div>
      </mat-card>

      <mat-card class="content-card">
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar clínica</mat-label>
            <input matInput [(ngModel)]="filtro" placeholder="Filtrar por nombre, dirección o teléfono...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <span class="total-badge">{{ clinicasFiltradas.length }} clínicas</span>
        </div>

        <div *ngIf="loading" class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando sedes y clínicas...</p>
        </div>

        <div class="table-container" *ngIf="!loading">
          <table mat-table [dataSource]="clinicasFiltradas" class="mat-elevation-z1 app-table">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef style="width: 70px">#</th>
              <td mat-cell *matCellDef="let c">{{ c.id }}</td>
            </ng-container>

            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef>Nombre de la Clínica</th>
              <td mat-cell *matCellDef="let c">
                <div class="font-semibold">{{ c.nombre }}</div>
                <div class="text-xs text-muted" *ngIf="c.horarioAtencion">
                  <mat-icon inline>schedule</mat-icon> {{ c.horarioAtencion }}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="direccion">
              <th mat-header-cell *matHeaderCellDef>Dirección</th>
              <td mat-cell *matCellDef="let c">{{ c.direccion }}</td>
            </ng-container>

            <ng-container matColumnDef="contacto">
              <th mat-header-cell *matHeaderCellDef>Contacto</th>
              <td mat-cell *matCellDef="let c">
                <div><mat-icon inline>phone</mat-icon> {{ c.telefono }}</div>
                <div *ngIf="c.correo" class="text-xs text-muted"><mat-icon inline>email</mat-icon> {{ c.correo }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="activo">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let c">
                <mat-chip [class.active-chip]="c.activo" [class.inactive-chip]="!c.activo" highlighted>
                  {{ c.activo ? 'ACTIVO' : 'INACTIVO' }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let c" class="actions-cell">
                <button
                  mat-icon-button
                  color="primary"
                  matTooltip="Editar"
                  *ngIf="auth.hasPermission('CLINICA_UPDATE')"
                  (click)="abrirModalEditar(c)"
                >
                  <mat-icon>edit</mat-icon>
                </button>

                <button
                  mat-icon-button
                  [color]="c.activo ? 'warn' : 'accent'"
                  [matTooltip]="c.activo ? 'Desactivar clínica' : 'Activar clínica'"
                  *ngIf="auth.hasPermission('CLINICA_UPDATE')"
                  (click)="toggleEstado(c)"
                >
                  <mat-icon>{{ c.activo ? 'block' : 'check_circle' }}</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell empty-state" [attr.colspan]="displayedColumns.length">
                No se encontraron clínicas registradas con ese criterio.
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
      display: flex;
      align-items: center;
      gap: 4px;
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
export class ClinicaListComponent implements OnInit {
  private service = inject(CatalogosService);
  auth = inject(AuthService);
  private notify = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  clinicas: Clinica[] = [];
  filtro = '';
  loading = true;

  readonly displayedColumns: string[] = [
    'id',
    'nombre',
    'direccion',
    'contacto',
    'activo',
    'acciones'
  ];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.service.listarClinicas(true).subscribe({
      next: (res) => {
        this.clinicas = res;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.notify.error('Error al cargar clínicas', err.error?.message || err.message);
        this.cdr.markForCheck();
      }
    });
  }

  get clinicasFiltradas(): Clinica[] {
    if (!this.filtro.trim()) return this.clinicas;
    const term = this.filtro.toLowerCase().trim();
    return this.clinicas.filter(c =>
      c.nombre.toLowerCase().includes(term) ||
      c.direccion.toLowerCase().includes(term) ||
      c.telefono.toLowerCase().includes(term)
    );
  }

  abrirModalCrear(): void {
    const ref = this.dialog.open(ClinicaFormDialogComponent, {
      width: '540px',
      data: { clinica: null }
    });

    ref.afterClosed().subscribe((req: ClinicaRequest) => {
      if (!req) return;
      this.service.crearClinica(req).subscribe({
        next: () => {
          this.notify.success('Clínica creada con éxito');
          this.cargarDatos();
        },
        error: (err) => this.notify.error('Error al crear clínica', err.error?.message || err.message)
      });
    });
  }

  abrirModalEditar(c: Clinica): void {
    const ref = this.dialog.open(ClinicaFormDialogComponent, {
      width: '540px',
      data: { clinica: c }
    });

    ref.afterClosed().subscribe((req: ClinicaRequest) => {
      if (!req || !c.id) return;
      this.service.actualizarClinica(c.id, req).subscribe({
        next: () => {
          this.notify.success('Clínica actualizada con éxito');
          this.cargarDatos();
        },
        error: (err) => this.notify.error('Error al actualizar clínica', err.error?.message || err.message)
      });
    });
  }

  toggleEstado(c: Clinica): void {
    if (!c.id) return;
    const accion = c.activo ? 'desactivar' : 'activar';
    this.notify.confirm(
      `¿Desea ${accion} la clínica "${c.nombre}"?`,
      `El registro pasará a estar ${c.activo ? 'inactivo' : 'activo'}.`
    ).then((confirmado) => {
      if (!confirmado) return;
      const obs = c.activo
        ? this.service.desactivarClinica(c.id!)
        : this.service.activarClinica(c.id!);

      obs.subscribe({
        next: () => {
          this.notify.success(`Clínica ${accion}da con éxito`);
          this.cargarDatos();
        },
        error: (err) => this.notify.error(`Error al ${accion} clínica`, err.error?.message || err.message)
      });
    });
  }
}
