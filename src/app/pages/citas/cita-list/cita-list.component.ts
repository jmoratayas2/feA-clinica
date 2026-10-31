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
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AgendaService } from '../../../services/agenda.service';
import { CatalogosService } from '../../../services/catalogos.service';
import { PacienteService } from '../../../services/paciente.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Cita, CitaRequest, EstadoCita } from '../../../models/clinica-operaciones/operaciones.model';
import { Clinica } from '../../../models/clinica/clinica.model';
import { Medico } from '../../../models/medico/medico.model';
import { Paciente } from '../../../models/paciente/paciente.model';
import { CitaFormDialogComponent } from '../cita-form-dialog/cita-form-dialog.component';

@Component({
  selector: 'app-cita-list',
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
    MatSelectModule,
    MatDialogModule
  ],
  template: `
    <div class="page-container">
      <mat-card class="header-card">
        <div class="header-content">
          <div>
            <h1 class="page-title">Agenda y Citas Médicas</h1>
            <p class="page-subtitle">Programación, control y seguimiento de consultas de pacientes</p>
          </div>
          <button
            mat-raised-button
            color="primary"
            *ngIf="auth.hasPermission('CITA_CREATE')"
            (click)="abrirModalCrear()"
          >
            <mat-icon>add_alarm</mat-icon> Agendar Cita
          </button>
        </div>
      </mat-card>

      <mat-card class="content-card">
        <div class="table-toolbar">
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar cita</mat-label>
              <input matInput [(ngModel)]="filtro" placeholder="Paciente, médico, sede, motivo...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="state-filter">
              <mat-label>Estado</mat-label>
              <mat-select [(ngModel)]="filtroEstado">
                <mat-option value="">Todos los estados</mat-option>
                <mat-option value="PROGRAMADA">PROGRAMADA</mat-option>
                <mat-option value="CONFIRMADA">CONFIRMADA</mat-option>
                <mat-option value="EN_CURSO">EN CURSO</mat-option>
                <mat-option value="ATENDIDA">ATENDIDA</mat-option>
                <mat-option value="CANCELADA">CANCELADA</mat-option>
                <mat-option value="NO_ASISTIO">NO ASISTIÓ</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <span class="total-badge">{{ citasFiltradas.length }} citas</span>
        </div>

        <div *ngIf="loading" class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando agenda de citas...</p>
        </div>

        <div class="table-container" *ngIf="!loading">
          <table mat-table [dataSource]="citasFiltradas" class="mat-elevation-z1 app-table">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef style="width: 70px">#</th>
              <td mat-cell *matCellDef="let c">{{ c.id }}</td>
            </ng-container>

            <ng-container matColumnDef="horario">
              <th mat-header-cell *matHeaderCellDef>Horario</th>
              <td mat-cell *matCellDef="let c">
                <div class="font-semibold">{{ c.fechaHoraInicio | date:'dd/MM/yyyy' }}</div>
                <div class="text-xs text-muted">
                  {{ c.fechaHoraInicio | date:'HH:mm' }} - {{ c.fechaHoraFin | date:'HH:mm' }}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="paciente">
              <th mat-header-cell *matHeaderCellDef>Paciente</th>
              <td mat-cell *matCellDef="let c">
                <span class="font-semibold">{{ c.paciente }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="medico">
              <th mat-header-cell *matHeaderCellDef>Médico y Sede</th>
              <td mat-cell *matCellDef="let c">
                <div>Dr(a). {{ c.medico }}</div>
                <div class="text-xs text-muted"><mat-icon inline>business</mat-icon> {{ c.clinica }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="motivo">
              <th mat-header-cell *matHeaderCellDef>Motivo</th>
              <td mat-cell *matCellDef="let c">
                <div class="text-sm">{{ c.motivo }}</div>
                <div *ngIf="c.observaciones" class="text-xs text-muted">{{ c.observaciones }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let c">
                <span class="status-badge" [ngClass]="'status-' + c.estado.toLowerCase()">
                  {{ c.estado }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let c" class="actions-cell">
                <!-- Cambiar Estado -->
                <button
                  mat-icon-button
                  color="accent"
                  matTooltip="Cambiar estado"
                  *ngIf="auth.hasPermission('CITA_UPDATE')"
                  (click)="cambiarEstadoCita(c)"
                >
                  <mat-icon>published_with_changes</mat-icon>
                </button>

                <!-- Editar -->
                <button
                  mat-icon-button
                  color="primary"
                  matTooltip="Modificar cita"
                  *ngIf="auth.hasPermission('CITA_UPDATE') && c.estado !== 'CANCELADA' && c.estado !== 'ATENDIDA'"
                  (click)="abrirModalEditar(c)"
                >
                  <mat-icon>edit</mat-icon>
                </button>

                <!-- Cancelar -->
                <button
                  mat-icon-button
                  color="warn"
                  matTooltip="Cancelar cita"
                  *ngIf="auth.hasPermission('CITA_CANCEL') && c.estado !== 'CANCELADA' && c.estado !== 'ATENDIDA'"
                  (click)="cancelarCita(c)"
                >
                  <mat-icon>cancel</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell empty-state" [attr.colspan]="displayedColumns.length">
                No se encontraron citas médicas con los filtros actuales.
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
    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .search-field {
      width: 320px;
    }
    .state-filter {
      width: 180px;
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
    .text-sm {
      font-size: 0.875rem;
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
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-programada {
      background: #e0f2fe;
      color: #0369a1;
    }
    .status-confirmada {
      background: #dbeafe;
      color: #1d4ed8;
    }
    .status-en_curso {
      background: #fef3c7;
      color: #b45309;
    }
    .status-atendida {
      background: #dcfce7;
      color: #15803d;
    }
    .status-cancelada {
      background: #fee2e2;
      color: #b91c1c;
    }
    .status-no_asistio {
      background: #f1f5f9;
      color: #64748b;
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
export class CitaListComponent implements OnInit {
  private service = inject(AgendaService);
  private catService = inject(CatalogosService);
  private pacService = inject(PacienteService);
  auth = inject(AuthService);
  private notify = inject(NotificationService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  citas: Cita[] = [];
  pacientes: Paciente[] = [];
  medicos: Medico[] = [];
  clinicas: Clinica[] = [];

  filtro = '';
  filtroEstado = '';
  loading = true;

  readonly displayedColumns: string[] = [
    'id',
    'horario',
    'paciente',
    'medico',
    'motivo',
    'estado',
    'acciones'
  ];

  ngOnInit(): void {
    if (this.auth.hasPermission('CITA_CREATE') || this.auth.hasPermission('CITA_UPDATE')) {
      this.cargarCatalogos();
    }
    this.cargarCitas();
  }

  cargarCatalogos(): void {
    if (this.auth.hasPermission('PACIENTE_READ') && this.pacientes.length === 0) {
      this.pacService.search({ page: 0, size: 100 }).subscribe({
        next: (res: any) => (this.pacientes = res.data),
        error: (e: any) => console.error('Error cargando pacientes', e)
      });
    }
    if (this.auth.hasPermission('MEDICO_READ') && this.medicos.length === 0) {
      this.catService.listarMedicos(false).subscribe({
        next: (res) => (this.medicos = res),
        error: (e) => console.error('Error cargando medicos', e)
      });
    }
    if (this.auth.hasPermission('CLINICA_READ') && this.clinicas.length === 0) {
      this.catService.listarClinicas(false).subscribe({
        next: (res) => (this.clinicas = res),
        error: (e) => console.error('Error cargando clinicas', e)
      });
    }
  }

  cargarCitas(): void {
    this.loading = true;
    this.service.listar().subscribe({
      next: (res) => {
        this.citas = res;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.notify.error('Error al cargar agenda', err.error?.message || err.message);
        this.cdr.markForCheck();
      }
    });
  }

  get citasFiltradas(): Cita[] {
    let result = this.citas;
    if (this.filtroEstado) {
      result = result.filter(c => c.estado === this.filtroEstado);
    }
    if (this.filtro.trim()) {
      const term = this.filtro.toLowerCase().trim();
      result = result.filter(c =>
        c.paciente.toLowerCase().includes(term) ||
        c.medico.toLowerCase().includes(term) ||
        c.clinica.toLowerCase().includes(term) ||
        c.motivo.toLowerCase().includes(term)
      );
    }
    return result;
  }

  abrirModalCrear(): void {
    const ref = this.dialog.open(CitaFormDialogComponent, {
      width: '600px',
      data: {
        cita: null,
        pacientes: this.pacientes,
        medicos: this.medicos,
        clinicas: this.clinicas
      }
    });

    ref.afterClosed().subscribe((req: CitaRequest) => {
      if (!req) return;
      this.service.crear(req).subscribe({
        next: () => {
          this.notify.success('Cita agendada con éxito');
          this.cargarCitas();
        },
        error: (err) => this.notify.error('Error al agendar cita', err.error?.message || err.message)
      });
    });
  }

  abrirModalEditar(c: Cita): void {
    const ref = this.dialog.open(CitaFormDialogComponent, {
      width: '600px',
      data: {
        cita: c,
        pacientes: this.pacientes,
        medicos: this.medicos,
        clinicas: this.clinicas
      }
    });

    ref.afterClosed().subscribe((req: CitaRequest) => {
      if (!req || !c.id) return;
      this.service.actualizar(c.id, req).subscribe({
        next: () => {
          this.notify.success('Cita actualizada con éxito');
          this.cargarCitas();
        },
        error: (err) => this.notify.error('Error al actualizar cita', err.error?.message || err.message)
      });
    });
  }

  cambiarEstadoCita(c: Cita): void {
    if (!c.id) return;
    const estados: EstadoCita[] = ['PROGRAMADA', 'CONFIRMADA', 'EN_CURSO', 'ATENDIDA', 'CANCELADA', 'NO_ASISTIO'];
    const proximoEstado = prompt(
      `Estado actual: ${c.estado}\nIngrese nuevo estado (${estados.join(', ')}):`,
      c.estado
    ) as EstadoCita;

    if (!proximoEstado || !estados.includes(proximoEstado)) return;

    this.service.cambiarEstado(c.id, proximoEstado).subscribe({
      next: () => {
        this.notify.success(`Estado actualizado a ${proximoEstado}`);
        this.cargarCitas();
      },
      error: (err) => this.notify.error('Error al cambiar estado', err.error?.message || err.message)
    });
  }

  cancelarCita(c: Cita): void {
    if (!c.id) return;
    this.notify.confirm(
      `¿Desea cancelar la cita del paciente ${c.paciente}?`,
      'La cita pasará a estado CANCELADA.'
    ).then((confirmado) => {
      if (!confirmado) return;
      this.service.cancelar(c.id!).subscribe({
        next: () => {
          this.notify.success('Cita cancelada con éxito');
          this.cargarCitas();
        },
        error: (err) => this.notify.error('Error al cancelar cita', err.error?.message || err.message)
      });
    });
  }
}
