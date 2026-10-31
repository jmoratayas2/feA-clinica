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
import { UsuarioService } from '../../../services/usuario.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Medico, MedicoRequest } from '../../../models/medico/medico.model';
import { MedicoFormDialogComponent, MedicoFormDialogResult } from '../medico-form-dialog/medico-form-dialog.component';
import { MedicoClinicasDialogComponent } from '../medico-clinicas-dialog/medico-clinicas-dialog.component';

@Component({
  selector: 'app-medico-list',
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
            <h1 class="page-title">Cuerpo Médico</h1>
            <p class="page-subtitle">Profesionales de la salud registrados y asignados a la clínica</p>
          </div>
          <button
            mat-raised-button
            color="primary"
            *ngIf="auth.hasPermission('MEDICO_CREATE')"
            (click)="abrirModalCrear()"
          >
            <mat-icon>person_add</mat-icon> Nuevo Médico
          </button>
        </div>
      </mat-card>

      <mat-card class="content-card">
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar médico</mat-label>
            <input matInput [(ngModel)]="filtro" placeholder="Filtrar por nombre, apellido, no. colegiado...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <span class="total-badge">{{ medicosFiltrados.length }} médicos</span>
        </div>

        <div *ngIf="loading" class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando médicos...</p>
        </div>

        <div class="table-container" *ngIf="!loading">
          <table mat-table [dataSource]="medicosFiltrados" class="mat-elevation-z1 app-table">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef style="width: 70px">#</th>
              <td mat-cell *matCellDef="let m">{{ m.id }}</td>
            </ng-container>

            <ng-container matColumnDef="nombreCompleto">
              <th mat-header-cell *matHeaderCellDef>Médico</th>
              <td mat-cell *matCellDef="let m">
                <div class="font-semibold">Dr(a). {{ m.nombres }} {{ m.apellidos }}</div>
                <div class="text-xs text-muted">
                  Colegiado: <span class="badge-col">{{ m.numeroColegiado }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="contacto">
              <th mat-header-cell *matHeaderCellDef>Contacto</th>
              <td mat-cell *matCellDef="let m">
                <div *ngIf="m.telefono"><mat-icon inline>phone</mat-icon> {{ m.telefono }}</div>
                <div *ngIf="m.correo" class="text-xs text-muted"><mat-icon inline>email</mat-icon> {{ m.correo }}</div>
                <span *ngIf="!m.telefono && !m.correo" class="text-muted">Sin contacto</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="activo">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let m">
                <mat-chip [class.active-chip]="m.activo" [class.inactive-chip]="!m.activo" highlighted>
                  {{ m.activo ? 'ACTIVO' : 'INACTIVO' }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let m" class="actions-cell">
                <button
                  mat-icon-button
                  color="primary"
                  matTooltip="Editar"
                  *ngIf="auth.hasPermission('MEDICO_UPDATE')"
                  (click)="abrirModalEditar(m)"
                >
                  <mat-icon>edit</mat-icon>
                </button>

                <button
                  mat-icon-button
                  color="accent"
                  matTooltip="Asignar o Ver Sedes / Clínicas"
                  *ngIf="auth.hasPermission('MEDICO_UPDATE')"
                  (click)="abrirModalClinicas(m)"
                >
                  <mat-icon>apartment</mat-icon>
                </button>

                <button
                  mat-icon-button
                  [color]="m.activo ? 'warn' : 'accent'"
                  [matTooltip]="m.activo ? 'Desactivar médico' : 'Activar médico'"
                  *ngIf="auth.hasPermission('MEDICO_UPDATE')"
                  (click)="toggleEstado(m)"
                >
                  <mat-icon>{{ m.activo ? 'block' : 'check_circle' }}</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell empty-state" [attr.colspan]="displayedColumns.length">
                No se encontraron médicos registrados.
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
    .badge-col {
      background: #e0f2fe;
      color: #0369a1;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
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
export class MedicoListComponent implements OnInit {
  private service = inject(CatalogosService);
  auth = inject(AuthService);
  private notify = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private usuarioService = inject(UsuarioService);

  medicos: Medico[] = [];
  filtro = '';
  loading = true;

  readonly displayedColumns: string[] = [
    'id',
    'nombreCompleto',
    'contacto',
    'activo',
    'acciones'
  ];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.service.listarMedicos(true).subscribe({
      next: (res) => {
        this.medicos = res;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.notify.error('Error al cargar médicos', err.error?.message || err.message);
        this.cdr.markForCheck();
      }
    });
  }

  get medicosFiltrados(): Medico[] {
    if (!this.filtro.trim()) return this.medicos;
    const term = this.filtro.toLowerCase().trim();
    return this.medicos.filter(m =>
      m.nombres.toLowerCase().includes(term) ||
      m.apellidos.toLowerCase().includes(term) ||
      m.numeroColegiado.toLowerCase().includes(term) ||
      (m.correo && m.correo.toLowerCase().includes(term))
    );
  }

  abrirModalCrear(): void {
    const ref = this.dialog.open(MedicoFormDialogComponent, {
      width: '560px',
      data: { medico: null }
    });

    ref.afterClosed().subscribe((res: any) => {
      if (!res) return;
      const req: MedicoRequest = res.medicoRequest || res;
      this.service.crearMedico(req).subscribe({
        next: (medicoCreado) => {
          if (res.crearUsuario && res.usuarioData) {
            this.usuarioService.crear(res.usuarioData).subscribe({
              next: (nuevoUsuario) => {
                // Asignar rol MEDICO si existe
                this.usuarioService.listarRoles().subscribe({
                  next: (roles) => {
                    const rolMedico = roles.find(r => r.nombre.toUpperCase().includes('MEDIC'));
                    if (rolMedico) {
                      this.usuarioService.asignarRol(nuevoUsuario.idUsuario, rolMedico.idRol).subscribe();
                    }
                  }
                });
                this.notify.success(
                  'Médico Registrado',
                  `Dr(a). ${medicoCreado.nombres} ${medicoCreado.apellidos} registrado. Usuario @${res.usuarioData.username} creado con acceso al sistema.`
                );
                this.cargarDatos();
              },
              error: (errUser) => {
                this.notify.warning(
                  'Médico Registrado',
                  `Médico registrado en la clínica, pero ocurrió un detalle al crear su usuario: ${errUser.error?.message || errUser.message}`
                );
                this.cargarDatos();
              }
            });
          } else {
            this.notify.success('Médico registrado con éxito');
            this.cargarDatos();
          }
        },
        error: (err) => this.notify.error('Error al registrar médico', err.error?.message || err.message)
      });
    });
  }

  abrirModalEditar(m: Medico): void {
    const ref = this.dialog.open(MedicoFormDialogComponent, {
      width: '560px',
      data: { medico: m }
    });

    ref.afterClosed().subscribe((res: any) => {
      if (!res || !m.id) return;
      const req: MedicoRequest = res.medicoRequest || res;
      this.service.actualizarMedico(m.id, req).subscribe({
        next: () => {
          this.notify.success('Médico actualizado con éxito');
          this.cargarDatos();
        },
        error: (err) => this.notify.error('Error al actualizar médico', err.error?.message || err.message)
      });
    });
  }

  abrirModalClinicas(m: Medico): void {
    const ref = this.dialog.open(MedicoClinicasDialogComponent, {
      width: '720px',
      data: { medico: m }
    });

    ref.afterClosed().subscribe((recargar) => {
      if (recargar) {
        this.cargarDatos();
      }
    });
  }

  toggleEstado(m: Medico): void {
    if (!m.id) return;
    const accion = m.activo ? 'desactivar' : 'activar';
    this.notify.confirm(
      `¿Desea ${accion} al médico Dr(a). ${m.nombres} ${m.apellidos}?`,
      `El registro pasará a estar ${m.activo ? 'inactivo' : 'activo'}.`
    ).then((confirmado) => {
      if (!confirmado) return;
      const obs = m.activo
        ? this.service.desactivarMedico(m.id!)
        : this.service.activarMedico(m.id!);

      obs.subscribe({
        next: () => {
          this.notify.success(`Médico ${accion}do con éxito`);
          this.cargarDatos();
        },
        error: (err) => this.notify.error(`Error al ${accion} médico`, err.error?.message || err.message)
      });
    });
  }
}
