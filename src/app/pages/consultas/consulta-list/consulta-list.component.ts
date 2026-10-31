import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ConsultaService } from '../../../services/consulta.service';
import { AgendaService } from '../../../services/agenda.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Consulta, ConsultaRequest, Cita } from '../../../models/clinica-operaciones/operaciones.model';
import { ConsultaFormDialogComponent } from '../consulta-form-dialog/consulta-form-dialog.component';
import { ConsultaDetailDialogComponent } from '../consulta-detail-dialog/consulta-detail-dialog.component';

@Component({
  selector: 'app-consulta-list',
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
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule
  ],
  template: `
    <div class="page-container">
      <mat-card class="header-card">
        <div class="header-content">
          <div>
            <h1 class="page-title">Consultas y Atenciones Médicas</h1>
            <p class="page-subtitle">Registro de expedientes clínicos, diagnósticos, recetas y planes médicos</p>
          </div>
          <button
            mat-raised-button
            color="primary"
            *ngIf="auth.hasPermission('CONSULTA_CREATE')"
            (click)="abrirModalCrear()"
          >
            <mat-icon>add_task</mat-icon> Nueva Consulta
          </button>
        </div>
      </mat-card>

      <mat-card class="content-card">
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar consulta</mat-label>
            <input matInput [(ngModel)]="filtro" placeholder="Filtrar por motivo, síntomas o plan...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <span class="total-badge">{{ consultasFiltradas.length }} consultas</span>
        </div>

        <div *ngIf="loading" class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando registros de consultas...</p>
        </div>

        <div class="table-container" *ngIf="!loading">
          <table mat-table [dataSource]="consultasFiltradas" class="mat-elevation-z1 app-table">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef style="width: 70px">#</th>
              <td mat-cell *matCellDef="let c">{{ c.id }}</td>
            </ng-container>

            <ng-container matColumnDef="fecha">
              <th mat-header-cell *matHeaderCellDef>Fecha y Hora</th>
              <td mat-cell *matCellDef="let c">
                <div class="font-semibold">{{ c.fechaHora | date:'dd/MM/yyyy' }}</div>
                <div class="text-xs text-muted">{{ c.fechaHora | date:'HH:mm' }} hrs</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="motivo">
              <th mat-header-cell *matHeaderCellDef>Motivo de Consulta</th>
              <td mat-cell *matCellDef="let c">
                <div class="font-semibold">{{ c.motivoConsulta }}</div>
                <div class="text-xs text-muted" *ngIf="c.citaId">
                  <mat-icon inline>event_note</mat-icon> Cita vinculada #{{ c.citaId }}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="clinica">
              <th mat-header-cell *matHeaderCellDef>Detalles Clínicos</th>
              <td mat-cell *matCellDef="let c">
                <div *ngIf="c.sintomas" class="text-xs"><strong>Síntomas:</strong> {{ c.sintomas }}</div>
                <div *ngIf="c.planGeneral" class="text-xs text-muted"><strong>Plan:</strong> {{ c.planGeneral }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let c" class="actions-cell">
                <button
                  mat-raised-button
                  color="accent"
                  class="btn-expediente"
                  matTooltip="Ver expediente completo, diagnósticos, recetas y exámenes"
                  (click)="verExpediente(c)"
                >
                  <mat-icon>folder_shared</mat-icon> Expediente
                </button>

                <button
                  mat-icon-button
                  color="primary"
                  matTooltip="Editar datos de consulta"
                  *ngIf="auth.hasPermission('CONSULTA_CREATE')"
                  (click)="abrirModalEditar(c)"
                >
                  <mat-icon>edit</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell empty-state" [attr.colspan]="displayedColumns.length">
                No se encontraron consultas registradas.
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
    .btn-expediente {
      margin-right: 8px;
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
export class ConsultaListComponent implements OnInit {
  private service = inject(ConsultaService);
  private agendaService = inject(AgendaService);
  auth = inject(AuthService);
  private notify = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  consultas: Consulta[] = [];
  citasDisponibles: Cita[] = [];
  filtro = '';
  loading = true;

  readonly displayedColumns: string[] = [
    'id',
    'fecha',
    'motivo',
    'clinica',
    'acciones'
  ];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    if (this.auth.hasPermission('CITA_READ')) {
      this.agendaService.listar().subscribe({
        next: (citas) => (this.citasDisponibles = citas),
        error: (e) => console.error(e)
      });
    }

    this.service.listar().subscribe({
      next: (res) => {
        this.consultas = res;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.notify.error('Error al cargar consultas', err.error?.message || err.message);
        this.cdr.markForCheck();
      }
    });
  }

  get consultasFiltradas(): Consulta[] {
    if (!this.filtro.trim()) return this.consultas;
    const term = this.filtro.toLowerCase().trim();
    return this.consultas.filter(c =>
      c.motivoConsulta.toLowerCase().includes(term) ||
      (c.sintomas && c.sintomas.toLowerCase().includes(term)) ||
      (c.planGeneral && c.planGeneral.toLowerCase().includes(term))
    );
  }

  abrirModalCrear(): void {
    const ref = this.dialog.open(ConsultaFormDialogComponent, {
      width: '600px',
      data: {
        consulta: null,
        citasDisponibles: this.citasDisponibles
      }
    });

    ref.afterClosed().subscribe((req: ConsultaRequest) => {
      if (!req) return;
      if (req.citaId) {
        this.agendaService.crearConsulta(req.citaId, req).subscribe({
          next: () => {
            this.notify.success('Consulta registrada con éxito');
            this.cargarDatos();
          },
          error: (err) => this.notify.error('Error al registrar consulta', err.error?.message || err.message)
        });
      } else {
        // Fallback: Si no tiene cita, podemos usar la primera cita disponible o alertar
        if (this.citasDisponibles.length > 0) {
          this.agendaService.crearConsulta(this.citasDisponibles[0].id!, req).subscribe({
            next: () => {
              this.notify.success('Consulta registrada con éxito');
              this.cargarDatos();
            },
            error: (err) => this.notify.error('Error al registrar consulta', err.error?.message || err.message)
          });
        } else {
          this.notify.error('Atención', 'Se requiere seleccionar o tener una cita para vincular la consulta');
        }
      }
    });
  }

  abrirModalEditar(c: Consulta): void {
    const ref = this.dialog.open(ConsultaFormDialogComponent, {
      width: '600px',
      data: {
        consulta: c,
        citasDisponibles: this.citasDisponibles
      }
    });

    ref.afterClosed().subscribe((req: ConsultaRequest) => {
      if (!req || !c.id) return;
      this.service.actualizar(c.id, req).subscribe({
        next: () => {
          this.notify.success('Consulta actualizada con éxito');
          this.cargarDatos();
        },
        error: (err) => this.notify.error('Error al actualizar consulta', err.error?.message || err.message)
      });
    });
  }

  verExpediente(c: Consulta): void {
    this.dialog.open(ConsultaDetailDialogComponent, {
      width: '850px',
      data: { consulta: c }
    });
  }
}
