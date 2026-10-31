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
import { MatTabsModule } from '@angular/material/tabs';

import { ExamenService } from '../../../services/examen.service';
import { CatalogosService } from '../../../services/catalogos.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  Examen,
  EstadoExamen,
  TipoExamen,
  TipoExamenRequest,
  ResultadoExamenRequest
} from '../../../models/examen/examen.model';
import { ResultadoDialogComponent } from '../resultado-dialog/resultado-dialog.component';
import { TipoExamenDialogComponent } from '../tipo-examen-dialog/tipo-examen-dialog.component';

@Component({
  selector: 'app-examen-list',
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
    MatDialogModule,
    MatTabsModule
  ],
  template: `
    <div class="page-container">
      <mat-card class="header-card">
        <div class="header-content">
          <div>
            <h1 class="page-title">Laboratorio y Exámenes Clínicos</h1>
            <p class="page-subtitle">Control de órdenes de laboratorio, toma de muestras y resultados diagnósticos</p>
          </div>
          <button
            mat-raised-button
            color="primary"
            *ngIf="auth.hasPermission('EXAMEN_CREATE')"
            (click)="abrirModalCrearTipo()"
          >
            <mat-icon>add</mat-icon> Nuevo Tipo de Examen
          </button>
        </div>
      </mat-card>

      <mat-card class="content-card">
        <mat-tab-group animationDuration="200ms">
          <!-- TAB 1: Órdenes de Exámenes -->
          <mat-tab label="Órdenes de Examen">
            <div class="tab-content">
              <div class="table-toolbar">
                <div class="filters-row">
                  <mat-form-field appearance="outline" class="search-field">
                    <mat-label>Buscar examen</mat-label>
                    <input matInput [(ngModel)]="filtroExamenes" placeholder="Tipo de examen, indicaciones...">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="state-filter">
                    <mat-label>Estado</mat-label>
                    <mat-select [(ngModel)]="filtroEstado">
                      <mat-option value="">Todos</mat-option>
                      <mat-option value="SOLICITADO">SOLICITADO</mat-option>
                      <mat-option value="EN_PROCESO">EN PROCESO</mat-option>
                      <mat-option value="COMPLETADO">COMPLETADO</mat-option>
                      <mat-option value="CANCELADO">CANCELADO</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <span class="total-badge">{{ examenesFiltrados.length }} exámenes</span>
              </div>

              <div *ngIf="loadingExamenes" class="loading-state">
                <mat-spinner diameter="40"></mat-spinner>
                <p>Cargando órdenes de laboratorio...</p>
              </div>

              <div class="table-container" *ngIf="!loadingExamenes">
                <table mat-table [dataSource]="examenesFiltrados" class="mat-elevation-z1 app-table">
                  <ng-container matColumnDef="id">
                    <th mat-header-cell *matHeaderCellDef style="width: 70px">#</th>
                    <td mat-cell *matCellDef="let ex">{{ ex.id }}</td>
                  </ng-container>

                  <ng-container matColumnDef="examen">
                    <th mat-header-cell *matHeaderCellDef>Tipo de Prueba</th>
                    <td mat-cell *matCellDef="let ex">
                      <div class="font-semibold">{{ ex.tipoExamen }}</div>
                      <div class="text-xs text-muted" *ngIf="ex.indicaciones">
                        Indicaciones: {{ ex.indicaciones }}
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="fecha">
                    <th mat-header-cell *matHeaderCellDef>Fecha Solicitud</th>
                    <td mat-cell *matCellDef="let ex">
                      <div>{{ ex.fechaSolicitud | date:'dd/MM/yyyy' }}</div>
                      <div class="text-xs text-muted">{{ ex.fechaSolicitud | date:'HH:mm' }} hrs</div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="prioridad">
                    <th mat-header-cell *matHeaderCellDef>Prioridad</th>
                    <td mat-cell *matCellDef="let ex">
                      <span class="priority-badge" [ngClass]="'prio-' + ex.prioridad.toLowerCase()">
                        {{ ex.prioridad }}
                      </span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="estado">
                    <th mat-header-cell *matHeaderCellDef>Estado</th>
                    <td mat-cell *matCellDef="let ex">
                      <span class="status-badge" [ngClass]="'status-' + ex.estado.toLowerCase()">
                        {{ ex.estado }}
                      </span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="acciones">
                    <th mat-header-cell *matHeaderCellDef>Acciones</th>
                    <td mat-cell *matCellDef="let ex" class="actions-cell">
                      <!-- En Proceso -->
                      <button
                        mat-icon-button
                        color="primary"
                        matTooltip="Marcar En Proceso"
                        *ngIf="auth.hasPermission('EXAMEN_UPDATE') && ex.estado === 'SOLICITADO'"
                        (click)="cambiarEstado(ex, 'EN_PROCESO')"
                      >
                        <mat-icon>hourglass_top</mat-icon>
                      </button>

                      <!-- Registrar Resultado -->
                      <button
                        mat-raised-button
                        color="primary"
                        class="btn-res"
                        *ngIf="auth.hasPermission('RESULTADO_EXAMEN_CREATE') && ex.estado !== 'COMPLETADO' && ex.estado !== 'CANCELADO'"
                        (click)="abrirModalResultado(ex)"
                      >
                        <mat-icon>biotech</mat-icon> Registrar Resultado
                      </button>

                      <!-- Ver Resultado -->
                      <button
                        mat-raised-button
                        color="accent"
                        class="btn-res"
                        *ngIf="auth.hasPermission('RESULTADO_EXAMEN_READ') && ex.estado === 'COMPLETADO'"
                        (click)="verResultado(ex)"
                      >
                        <mat-icon>visibility</mat-icon> Ver Resultado
                      </button>

                      <!-- Cancelar -->
                      <button
                        mat-icon-button
                        color="warn"
                        matTooltip="Cancelar examen"
                        *ngIf="auth.hasPermission('EXAMEN_UPDATE') && ex.estado !== 'COMPLETADO' && ex.estado !== 'CANCELADO'"
                        (click)="cancelarExamen(ex)"
                      >
                        <mat-icon>cancel</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedExamenColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedExamenColumns;"></tr>

                  <tr class="mat-row" *matNoDataRow>
                    <td class="mat-cell empty-state" [attr.colspan]="displayedExamenColumns.length">
                      No se encontraron órdenes de examen registradas.
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </mat-tab>

          <!-- TAB 2: Catálogo de Tipos de Examen -->
          <mat-tab [label]="'Catálogo de Pruebas (' + tiposExamen.length + ')'">
            <div class="tab-content">
              <div class="table-container">
                <table mat-table [dataSource]="tiposExamen" class="mat-elevation-z1 app-table">
                  <ng-container matColumnDef="id">
                    <th mat-header-cell *matHeaderCellDef style="width: 70px">#</th>
                    <td mat-cell *matCellDef="let te">{{ te.id }}</td>
                  </ng-container>

                  <ng-container matColumnDef="nombre">
                    <th mat-header-cell *matHeaderCellDef>Prueba</th>
                    <td mat-cell *matCellDef="let te">
                      <span class="font-semibold">{{ te.nombre }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="categoria">
                    <th mat-header-cell *matHeaderCellDef>Categoría</th>
                    <td mat-cell *matCellDef="let te">{{ te.categoria }}</td>
                  </ng-container>

                  <ng-container matColumnDef="descripcion">
                    <th mat-header-cell *matHeaderCellDef>Descripción</th>
                    <td mat-cell *matCellDef="let te">{{ te.descripcion || 'Sin descripción' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="activo">
                    <th mat-header-cell *matHeaderCellDef>Estado</th>
                    <td mat-cell *matCellDef="let te">
                      <mat-chip [class.active-chip]="te.activo" [class.inactive-chip]="!te.activo" highlighted>
                        {{ te.activo ? 'ACTIVO' : 'INACTIVO' }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="acciones">
                    <th mat-header-cell *matHeaderCellDef>Acciones</th>
                    <td mat-cell *matCellDef="let te" class="actions-cell">
                      <button
                        mat-icon-button
                        color="primary"
                        matTooltip="Editar"
                        *ngIf="auth.hasPermission('EXAMEN_UPDATE')"
                        (click)="abrirModalEditarTipo(te)"
                      >
                        <mat-icon>edit</mat-icon>
                      </button>

                      <button
                        mat-icon-button
                        [color]="te.activo ? 'warn' : 'accent'"
                        [matTooltip]="te.activo ? 'Desactivar prueba' : 'Activar prueba'"
                        *ngIf="auth.hasPermission('EXAMEN_UPDATE')"
                        (click)="toggleEstadoTipo(te)"
                      >
                        <mat-icon>{{ te.activo ? 'block' : 'check_circle' }}</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedTipoColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedTipoColumns;"></tr>
                </table>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
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
    .tab-content {
      padding-top: 16px;
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
    .text-xs {
      font-size: 0.75rem;
    }
    .text-muted {
      color: #64748b;
    }
    .priority-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .prio-baja { background: #f1f5f9; color: #475569; }
    .prio-media { background: #e0f2fe; color: #0284c7; }
    .prio-alta { background: #fef3c7; color: #d97706; }
    .prio-urgente { background: #fee2e2; color: #dc2626; }
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .status-solicitado { background: #e0f2fe; color: #0369a1; }
    .status-en_proceso { background: #fef3c7; color: #b45309; }
    .status-completado { background: #dcfce7; color: #15803d; }
    .status-cancelado { background: #fee2e2; color: #b91c1c; }
    .active-chip { background-color: #dcfce7 !important; color: #166534 !important; }
    .inactive-chip { background-color: #fee2e2 !important; color: #991b1b !important; }
    .btn-res {
      margin-right: 6px;
      font-size: 0.8rem;
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
export class ExamenListComponent implements OnInit {
  private examenService = inject(ExamenService);
  private catService = inject(CatalogosService);
  auth = inject(AuthService);
  private notify = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  examenes: Examen[] = [];
  tiposExamen: TipoExamen[] = [];
  filtroExamenes = '';
  filtroEstado = '';
  loadingExamenes = true;

  readonly displayedExamenColumns: string[] = [
    'id',
    'examen',
    'fecha',
    'prioridad',
    'estado',
    'acciones'
  ];

  readonly displayedTipoColumns: string[] = [
    'id',
    'nombre',
    'categoria',
    'descripcion',
    'activo',
    'acciones'
  ];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loadingExamenes = true;
    this.catService.listarTiposExamen(true).subscribe({
      next: (res) => (this.tiposExamen = res),
      error: (e) => console.error(e)
    });

    this.examenService.listarExamenes().subscribe({
      next: (res) => {
        this.examenes = res;
        this.loadingExamenes = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loadingExamenes = false;
        this.notify.error('Error al cargar exámenes', err.error?.message || err.message);
        this.cdr.markForCheck();
      }
    });
  }

  get examenesFiltrados(): Examen[] {
    let result = this.examenes;
    if (this.filtroEstado) {
      result = result.filter(e => e.estado === this.filtroEstado);
    }
    if (this.filtroExamenes.trim()) {
      const term = this.filtroExamenes.toLowerCase().trim();
      result = result.filter(e =>
        e.tipoExamen.toLowerCase().includes(term) ||
        (e.indicaciones && e.indicaciones.toLowerCase().includes(term))
      );
    }
    return result;
  }

  cambiarEstado(ex: Examen, nuevoEstado: EstadoExamen): void {
    if (!ex.id) return;
    this.examenService.cambiarEstado(ex.id, nuevoEstado).subscribe({
      next: () => {
        this.notify.success(`Examen marcado como ${nuevoEstado}`);
        this.cargarDatos();
      },
      error: (err) => this.notify.error('Error al cambiar estado', err.error?.message || err.message)
    });
  }

  cancelarExamen(ex: Examen): void {
    if (!ex.id) return;
    this.notify.confirm(
      `¿Desea cancelar el examen ${ex.tipoExamen}?`,
      'El estado cambiará a CANCELADO.'
    ).then((confirmado) => {
      if (!confirmado) return;
      this.examenService.cancelarExamen(ex.id!).subscribe({
        next: () => {
          this.notify.success('Examen cancelado');
          this.cargarDatos();
        },
        error: (err) => this.notify.error('Error al cancelar', err.error?.message || err.message)
      });
    });
  }

  abrirModalResultado(ex: Examen): void {
    const ref = this.dialog.open(ResultadoDialogComponent, {
      width: '600px',
      data: {
        examen: ex,
        resultado: null,
        readonly: false
      }
    });

    ref.afterClosed().subscribe((req: ResultadoExamenRequest) => {
      if (!req || !ex.id) return;
      this.examenService.registrarResultado(ex.id, req).subscribe({
        next: () => {
          this.notify.success('Resultado registrado exitosamente');
          this.cargarDatos();
        },
        error: (err) => this.notify.error('Error al registrar resultado', err.error?.message || err.message)
      });
    });
  }

  verResultado(ex: Examen): void {
    if (!ex.id) return;
    this.examenService.obtenerResultadoPorExamen(ex.id).subscribe({
      next: (res) => {
        this.dialog.open(ResultadoDialogComponent, {
          width: '600px',
          data: {
            examen: ex,
            resultado: res,
            readonly: true
          }
        });
      },
      error: (err) => this.notify.error('No se pudo cargar el resultado', err.error?.message || err.message)
    });
  }

  abrirModalCrearTipo(): void {
    const ref = this.dialog.open(TipoExamenDialogComponent, {
      width: '500px',
      data: { tipo: null }
    });

    ref.afterClosed().subscribe((req: TipoExamenRequest) => {
      if (!req) return;
      this.catService.crearTipoExamen(req).subscribe({
        next: () => {
          this.notify.success('Tipo de examen creado con éxito');
          this.cargarDatos();
        },
        error: (err) => this.notify.error('Error al crear prueba', err.error?.message || err.message)
      });
    });
  }

  abrirModalEditarTipo(te: TipoExamen): void {
    const ref = this.dialog.open(TipoExamenDialogComponent, {
      width: '500px',
      data: { tipo: te }
    });

    ref.afterClosed().subscribe((req: TipoExamenRequest) => {
      if (!req || !te.id) return;
      this.catService.actualizarTipoExamen(te.id, req).subscribe({
        next: () => {
          this.notify.success('Tipo de examen actualizado');
          this.cargarDatos();
        },
        error: (err) => this.notify.error('Error al actualizar', err.error?.message || err.message)
      });
    });
  }

  toggleEstadoTipo(te: TipoExamen): void {
    if (!te.id) return;
    const accion = te.activo ? 'desactivar' : 'activar';
    this.notify.confirm(
      `¿Desea ${accion} el tipo de examen "${te.nombre}"?`,
      `El registro pasará a estar ${te.activo ? 'inactivo' : 'activo'}.`
    ).then((confirmado) => {
      if (!confirmado) return;
      const obs = te.activo
        ? this.catService.desactivarTipoExamen(te.id!)
        : this.catService.activarTipoExamen(te.id!);

      obs.subscribe({
        next: () => {
          this.notify.success(`Tipo de examen ${accion}do con éxito`);
          this.cargarDatos();
        },
        error: (err) => this.notify.error(`Error al ${accion}`, err.error?.message || err.message)
      });
    });
  }
}
