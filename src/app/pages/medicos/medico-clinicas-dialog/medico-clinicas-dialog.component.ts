import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CatalogosService } from '../../../services/catalogos.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Medico, MedicoClinica } from '../../../models/medico/medico.model';
import { Clinica } from '../../../models/clinica/clinica.model';

export interface MedicoClinicasDialogData {
  medico: Medico;
}

@Component({
  selector: 'app-medico-clinicas-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon>apartment</mat-icon>
      Sedes y Clínicas del Dr(a). {{ data.medico.nombres }} {{ data.medico.apellidos }}
    </h2>

    <mat-dialog-content class="dialog-content">
      <p class="subtitle">
        Gestiona las clínicas o sedes donde este médico atiende a los pacientes y su consultorio asignado.
      </p>

      <!-- Formulario para asignar nueva sede -->
      <div class="form-container">
        <h3 class="form-title">
          <mat-icon inline>add_business</mat-icon> Enlazar Nueva Clínica
        </h3>

        <form [formGroup]="form" (ngSubmit)="asignarClinica()" class="assign-form">
          <div class="form-grid">
            <mat-form-field appearance="outline" class="field">
              <mat-label>Seleccionar Clínica / Sede</mat-label>
              <mat-select formControlName="clinicaId">
                <mat-option *ngFor="let c of clinicasDisponibles" [value]="c.id">
                  {{ c.nombre }} ({{ c.direccion }})
                </mat-option>
                <mat-option *ngIf="clinicasDisponibles.length === 0" disabled>
                  No hay más clínicas disponibles para enlazar
                </mat-option>
              </mat-select>
              <mat-error *ngIf="form.get('clinicaId')?.hasError('required')">Debe seleccionar una clínica</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="field">
              <mat-label>Consultorio / Módulo</mat-label>
              <input matInput formControlName="consultorio" placeholder="Ej: Consultorio 102, Edificio B">
            </mat-form-field>

            <mat-form-field appearance="outline" class="field">
              <mat-label>Fecha de Ingreso</mat-label>
              <input matInput type="date" formControlName="fechaIngreso">
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="form.invalid || submitting"
            >
              <mat-icon>link</mat-icon> Enlazar Médico a Clínica
            </button>
          </div>
        </form>
      </div>

      <!-- Listado de relaciones existentes -->
      <div class="list-section">
        <div class="list-header">
          <h3>Clínicas Asignadas Actualmente ({{ relaciones.length }})</h3>
          <button mat-icon-button (click)="cargarRelaciones()" matTooltip="Refrescar lista">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>

        <div *ngIf="loading" class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Cargando asignaciones...</span>
        </div>

        <div *ngIf="!loading && relaciones.length === 0" class="empty-state">
          <mat-icon>info</mat-icon>
          <p>Este médico aún no está enlazado a ninguna clínica. Utilice el formulario superior para asignarle una sede.</p>
        </div>

        <div *ngIf="!loading && relaciones.length > 0" class="cards-grid">
          <div *ngFor="let r of relaciones" class="relation-card" [class.inactive]="!r.activo">
            <div class="relation-icon">
              <mat-icon>local_hospital</mat-icon>
            </div>
            <div class="relation-info">
              <div class="relation-name">{{ r.clinica }}</div>
              <div class="relation-detail" *ngIf="r.consultorio">
                <mat-icon inline>meeting_room</mat-icon> {{ r.consultorio }}
              </div>
              <div class="relation-detail" *ngIf="r.fechaIngreso">
                <mat-icon inline>calendar_today</mat-icon> Ingreso: {{ r.fechaIngreso }}
              </div>
              <div class="relation-status">
                <mat-chip [class.chip-active]="r.activo" [class.chip-inactive]="!r.activo">
                  {{ r.activo ? 'ACTIVO EN SEDE' : 'INACTIVO' }}
                </mat-chip>
              </div>
            </div>
            <div class="relation-actions">
              <button
                *ngIf="r.activo"
                mat-icon-button
                color="warn"
                matTooltip="Desenlazar de esta clínica"
                (click)="desactivarRelacion(r)"
              >
                <mat-icon>link_off</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="dialogRef.close(true)">Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #1e3a8a;
      font-size: 1.25rem;
      margin: 0;
      padding: 18px 24px;
      border-bottom: 1px solid #e2e8f0;
    }
    .dialog-content {
      padding: 20px 24px;
      min-width: 600px;
      max-width: 750px;
    }
    .subtitle {
      color: #64748b;
      margin: 0 0 16px 0;
      font-size: 0.9rem;
    }
    .form-container {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .form-title {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 2fr 1.2fr 1fr;
      gap: 12px;
    }
    .field {
      width: 100%;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }
    .list-section {
      margin-top: 8px;
    }
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .list-header h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }
    .loading-state {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px;
      color: #64748b;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 28px;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      color: #64748b;
      text-align: center;
    }
    .empty-state mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      margin-bottom: 8px;
      color: #94a3b8;
    }
    .cards-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .relation-card {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
    }
    .relation-card:hover {
      border-color: #cbd5e1;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    }
    .relation-card.inactive {
      opacity: 0.6;
      background: #f8fafc;
    }
    .relation-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: #e0f2fe;
      color: #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 14px;
    }
    .relation-info {
      flex: 1;
    }
    .relation-name {
      font-weight: 600;
      color: #0f172a;
      font-size: 0.95rem;
    }
    .relation-detail {
      font-size: 0.82rem;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 2px;
    }
    .relation-status {
      margin-top: 6px;
    }
    .chip-active {
      background-color: #dcfce7 !important;
      color: #15803d !important;
      font-size: 0.72rem;
      font-weight: 600;
    }
    .chip-inactive {
      background-color: #fee2e2 !important;
      color: #b91c1c !important;
      font-size: 0.72rem;
    }
    .dialog-actions {
      padding: 12px 24px;
      border-top: 1px solid #e2e8f0;
    }
  `]
})
export class MedicoClinicasDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private catalogosService = inject(CatalogosService);
  private notification = inject(NotificationService);
  public dialogRef = inject(MatDialogRef<MedicoClinicasDialogComponent>);

  @Inject(MAT_DIALOG_DATA) public data!: MedicoClinicasDialogData;

  form!: FormGroup;
  todasClinicas: Clinica[] = [];
  relaciones: MedicoClinica[] = [];
  loading = false;
  submitting = false;

  get clinicasDisponibles(): Clinica[] {
    const asignadasIds = this.relaciones.filter(r => r.activo).map(r => r.clinicaId);
    return this.todasClinicas.filter(c => c.activo && !asignadasIds.includes(c.id!));
  }

  ngOnInit(): void {
    const today = new Date().toISOString().substring(0, 10);
    this.form = this.fb.group({
      clinicaId: [null, [Validators.required]],
      consultorio: [''],
      fechaIngreso: [today]
    });

    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.catalogosService.listarClinicas(false).subscribe({
      next: (clinicas) => {
        this.todasClinicas = clinicas;
        this.cargarRelaciones();
      },
      error: (err) => {
        this.loading = false;
        this.notification.error('Error al cargar catálogo de clínicas: ' + (err.message || 'Error de conexión'));
      }
    });
  }

  cargarRelaciones(): void {
    if (!this.data.medico.id) return;
    this.loading = true;
    this.catalogosService.listarClinicasDeMedico(this.data.medico.id, true).subscribe({
      next: (rels) => {
        this.relaciones = rels;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notification.error('Error al cargar clínicas del médico: ' + (err.message || 'Error de conexión'));
      }
    });
  }

  asignarClinica(): void {
    if (this.form.invalid || !this.data.medico.id) return;

    this.submitting = true;
    const req = {
      medicoId: this.data.medico.id,
      clinicaId: Number(this.form.value.clinicaId),
      consultorio: this.form.value.consultorio?.trim() || undefined,
      fechaIngreso: this.form.value.fechaIngreso || undefined
    };

    this.catalogosService.asignarMedicoClinica(this.data.medico.id, req).subscribe({
      next: () => {
        this.submitting = false;
        this.notification.success('Médico enlazado exitosamente a la clínica.');
        this.form.patchValue({
          clinicaId: null,
          consultorio: ''
        });
        this.cargarRelaciones();
      },
      error: (err) => {
        this.submitting = false;
        this.notification.error('No se pudo enlazar el médico: ' + (err.error?.message || err.message || 'Error'));
      }
    });
  }

  desactivarRelacion(relacion: MedicoClinica): void {
    if (!confirm(`¿Está seguro de desenlazar al Dr(a). ${this.data.medico.nombres} de la clínica ${relacion.clinica}?`)) {
      return;
    }

    this.catalogosService.desactivarMedicoClinica(relacion.id).subscribe({
      next: () => {
        this.notification.success('Relación con la clínica desactivada.');
        this.cargarRelaciones();
      },
      error: (err) => {
        this.notification.error('Error al desactivar: ' + (err.error?.message || err.message || 'Error'));
      }
    });
  }
}
