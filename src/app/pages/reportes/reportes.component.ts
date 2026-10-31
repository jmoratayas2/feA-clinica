import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

import { PacienteService } from '../../services/paciente.service';
import { AgendaService } from '../../services/agenda.service';
import { CatalogosService } from '../../services/catalogos.service';
import { ConsultaService } from '../../services/consulta.service';
import { ExamenService } from '../../services/examen.service';
import { Cita } from '../../models/clinica-operaciones/operaciones.model';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule
  ],
  template: `
    <div class="page-container">
      <mat-card class="header-card">
        <div class="header-content">
          <div>
            <h1 class="page-title">Panel de Métricas y Reportes Clínicos</h1>
            <p class="page-subtitle">Indicadores clave de rendimiento, volumen de atenciones y capacidad instalada</p>
          </div>
          <button mat-raised-button color="primary" (click)="cargarMetricas()">
            <mat-icon>refresh</mat-icon> Actualizar Datos
          </button>
        </div>
      </mat-card>

      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Consolidando estadísticas del sistema...</p>
      </div>

      <div *ngIf="!loading" class="dashboard-content">
        <!-- Tarjetas de KPIs -->
        <div class="kpi-grid">
          <mat-card class="kpi-card card-blue">
            <div class="kpi-icon"><mat-icon>people</mat-icon></div>
            <div class="kpi-info">
              <span class="kpi-value">{{ totalPacientes }}</span>
              <span class="kpi-label">Pacientes Registrados</span>
            </div>
          </mat-card>

          <mat-card class="kpi-card card-indigo">
            <div class="kpi-icon"><mat-icon>event_available</mat-icon></div>
            <div class="kpi-info">
              <span class="kpi-value">{{ totalCitas }}</span>
              <span class="kpi-label">Citas Agendadas</span>
            </div>
          </mat-card>

          <mat-card class="kpi-card card-emerald">
            <div class="kpi-icon"><mat-icon>medical_services</mat-icon></div>
            <div class="kpi-info">
              <span class="kpi-value">{{ totalMedicos }}</span>
              <span class="kpi-label">Médicos Activos</span>
            </div>
          </mat-card>

          <mat-card class="kpi-card card-cyan">
            <div class="kpi-icon"><mat-icon>local_hospital</mat-icon></div>
            <div class="kpi-info">
              <span class="kpi-value">{{ totalClinicas }}</span>
              <span class="kpi-label">Clínicas / Sedes</span>
            </div>
          </mat-card>

          <mat-card class="kpi-card card-purple">
            <div class="kpi-icon"><mat-icon>science</mat-icon></div>
            <div class="kpi-info">
              <span class="kpi-value">{{ totalExamenes }}</span>
              <span class="kpi-label">Órdenes de Examen</span>
            </div>
          </mat-card>

          <mat-card class="kpi-card card-amber">
            <div class="kpi-icon"><mat-icon>medication</mat-icon></div>
            <div class="kpi-info">
              <span class="kpi-value">{{ totalMedicamentos }}</span>
              <span class="kpi-label">Fármacos en Catálogo</span>
            </div>
          </mat-card>
        </div>

        <!-- Secciones de Desglose -->
        <div class="details-grid">
          <!-- Desglose de Citas por Estado -->
          <mat-card class="detail-card">
            <h2 class="card-title"><mat-icon>donut_small</mat-icon> Estado de Citas Médicas</h2>
            <div class="status-summary-grid">
              <div class="status-box">
                <span class="box-number text-blue">{{ citasPorEstado.programadas }}</span>
                <span class="box-label">Programadas</span>
              </div>
              <div class="status-box">
                <span class="box-number text-indigo">{{ citasPorEstado.confirmadas }}</span>
                <span class="box-label">Confirmadas</span>
              </div>
              <div class="status-box">
                <span class="box-number text-amber">{{ citasPorEstado.enCurso }}</span>
                <span class="box-label">En Curso</span>
              </div>
              <div class="status-box">
                <span class="box-number text-emerald">{{ citasPorEstado.atendidas }}</span>
                <span class="box-label">Atendidas</span>
              </div>
              <div class="status-box">
                <span class="box-number text-red">{{ citasPorEstado.canceladas }}</span>
                <span class="box-label">Canceladas</span>
              </div>
            </div>
          </mat-card>

          <!-- Últimas Citas Programadas -->
          <mat-card class="detail-card">
            <h2 class="card-title"><mat-icon>schedule</mat-icon> Últimas Citas Agendadas</h2>
            <div class="table-mini">
              <table mat-table [dataSource]="ultimasCitas" class="app-table">
                <ng-container matColumnDef="horario">
                  <th mat-header-cell *matHeaderCellDef>Fecha / Hora</th>
                  <td mat-cell *matCellDef="let c">{{ c.fechaHoraInicio | date:'dd/MM/yyyy HH:mm' }}</td>
                </ng-container>

                <ng-container matColumnDef="paciente">
                  <th mat-header-cell *matHeaderCellDef>Paciente</th>
                  <td mat-cell *matCellDef="let c" class="font-semibold">{{ c.paciente }}</td>
                </ng-container>

                <ng-container matColumnDef="medico">
                  <th mat-header-cell *matHeaderCellDef>Médico</th>
                  <td mat-cell *matCellDef="let c">Dr(a). {{ c.medico }}</td>
                </ng-container>

                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let c">
                    <span class="chip-sm" [ngClass]="'status-' + c.estado.toLowerCase()">{{ c.estado }}</span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedMiniColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedMiniColumns;"></tr>
              </table>
            </div>
          </mat-card>
        </div>
      </div>
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
    .loading-state {
      text-align: center;
      padding: 60px;
      color: #64748b;
    }
    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }
    .kpi-card {
      padding: 20px;
      border-radius: 12px;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07);
    }
    .kpi-icon {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .kpi-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .card-blue .kpi-icon { background: #dbeafe; color: #1e40af; }
    .card-indigo .kpi-icon { background: #e0e7ff; color: #4338ca; }
    .card-emerald .kpi-icon { background: #d1fae5; color: #065f46; }
    .card-cyan .kpi-icon { background: #cffafe; color: #155e75; }
    .card-purple .kpi-icon { background: #ede9fe; color: #5b21b6; }
    .card-amber .kpi-icon { background: #fef3c7; color: #92400e; }

    .kpi-info {
      display: flex;
      flex-direction: column;
    }
    .kpi-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.1;
    }
    .kpi-label {
      font-size: 0.85rem;
      color: #64748b;
      margin-top: 4px;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    @media (max-width: 960px) {
      .details-grid {
        grid-template-columns: 1fr;
      }
    }
    .detail-card {
      padding: 20px;
      border-radius: 12px;
    }
    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e3a8a;
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 12px;
    }
    .status-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px 10px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .box-number {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1;
    }
    .box-label {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 6px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .text-blue { color: #2563eb; }
    .text-indigo { color: #4f46e5; }
    .text-amber { color: #d97706; }
    .text-emerald { color: #059669; }
    .text-red { color: #dc2626; }

    .table-mini {
      overflow-x: auto;
    }
    .app-table {
      width: 100%;
    }
    .font-semibold {
      font-weight: 600;
    }
    .chip-sm {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .status-programada { background: #e0f2fe; color: #0369a1; }
    .status-confirmada { background: #dbeafe; color: #1d4ed8; }
    .status-en_curso { background: #fef3c7; color: #b45309; }
    .status-atendida { background: #dcfce7; color: #15803d; }
    .status-cancelada { background: #fee2e2; color: #b91c1c; }
  `]
})
export class ReportesComponent implements OnInit {
  private pacienteService = inject(PacienteService);
  private agendaService = inject(AgendaService);
  private catalogosService = inject(CatalogosService);
  private examenService = inject(ExamenService);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  totalPacientes = 0;
  totalCitas = 0;
  totalMedicos = 0;
  totalClinicas = 0;
  totalExamenes = 0;
  totalMedicamentos = 0;

  citasPorEstado = {
    programadas: 0,
    confirmadas: 0,
    enCurso: 0,
    atendidas: 0,
    canceladas: 0
  };

  ultimasCitas: Cita[] = [];
  readonly displayedMiniColumns: string[] = ['horario', 'paciente', 'medico', 'estado'];

  ngOnInit(): void {
    this.cargarMetricas();
  }

  cargarMetricas(): void {
    this.loading = true;

    this.pacienteService.search({ page: 0, size: 1 }).subscribe({
      next: (res: any) => (this.totalPacientes = res.pagination?.totalElements || 0),
      error: (e: any) => console.error(e)
    });

    this.catalogosService.listarMedicos(false).subscribe({
      next: (res: any) => (this.totalMedicos = res.length),
      error: (e: any) => console.error(e)
    });

    this.catalogosService.listarClinicas(false).subscribe({
      next: (res: any) => (this.totalClinicas = res.length),
      error: (e: any) => console.error(e)
    });

    this.catalogosService.listarMedicamentos(false).subscribe({
      next: (res: any) => (this.totalMedicamentos = res.length),
      error: (e: any) => console.error(e)
    });

    this.examenService.listarExamenes().subscribe({
      next: (res: any) => (this.totalExamenes = res.length),
      error: (e: any) => console.error(e)
    });

    this.agendaService.listar().subscribe({
      next: (citas) => {
        this.totalCitas = citas.length;
        this.citasPorEstado.programadas = citas.filter(c => c.estado === 'PROGRAMADA').length;
        this.citasPorEstado.confirmadas = citas.filter(c => c.estado === 'CONFIRMADA').length;
        this.citasPorEstado.enCurso = citas.filter(c => c.estado === 'EN_CURSO').length;
        this.citasPorEstado.atendidas = citas.filter(c => c.estado === 'ATENDIDA').length;
        this.citasPorEstado.canceladas = citas.filter(c => c.estado === 'CANCELADA').length;
        this.ultimasCitas = citas.slice(0, 5);

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
