import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Cita, CitaRequest } from '../../../models/clinica-operaciones/operaciones.model';
import { Clinica } from '../../../models/clinica/clinica.model';
import { Medico } from '../../../models/medico/medico.model';
import { Paciente } from '../../../models/paciente/paciente.model';

export interface CitaFormDialogData {
  cita?: Cita | null;
  pacientes: Paciente[];
  medicos: Medico[];
  clinicas: Clinica[];
}

@Component({
  selector: 'app-cita-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon>{{ isEdit ? 'edit_calendar' : 'event' }}</mat-icon>
      {{ isEdit ? 'Modificar Cita' : 'Agendar Nueva Cita' }}
    </h2>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Paciente</mat-label>
          <mat-select formControlName="pacienteId">
            <mat-option *ngFor="let p of data.pacientes" [value]="p.id">
              {{ p.nombres }} {{ p.apellidos }} (ID: {{ p.numeroIdentificacion || 'N/A' }})
            </mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('pacienteId')?.hasError('required')">El paciente es obligatorio</mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Médico</mat-label>
            <mat-select formControlName="medicoId">
              <mat-option *ngFor="let m of data.medicos" [value]="m.id">
                Dr(a). {{ m.nombres }} {{ m.apellidos }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('medicoId')?.hasError('required')">El médico es obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Sede / Clínica</mat-label>
            <mat-select formControlName="clinicaId">
              <mat-option *ngFor="let c of data.clinicas" [value]="c.id">
                {{ c.nombre }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('clinicaId')?.hasError('required')">La clínica es obligatoria</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Fecha y Hora Inicio</mat-label>
            <input matInput type="datetime-local" formControlName="fechaHoraInicio">
            <mat-error *ngIf="form.get('fechaHoraInicio')?.hasError('required')">Fecha inicio requerida</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Fecha y Hora Fin</mat-label>
            <input matInput type="datetime-local" formControlName="fechaHoraFin">
            <mat-error *ngIf="form.get('fechaHoraFin')?.hasError('required')">Fecha fin requerida</mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Motivo de la Cita</mat-label>
          <input matInput formControlName="motivo" placeholder="Ej: Control de hipertensión, consulta general...">
          <mat-error *ngIf="form.get('motivo')?.hasError('required')">El motivo es obligatorio</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Observaciones (Opcional)</mat-label>
          <textarea matInput formControlName="observaciones" rows="2" placeholder="Indicaciones previas o notas..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="onSubmit()">
        <mat-icon>calendar_today</mat-icon> {{ isEdit ? 'Guardar Cambios' : 'Agendar Cita' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e3a8a;
      margin: 0;
      padding: 16px 24px;
    }
    .dialog-content {
      padding: 16px 24px;
      min-width: 520px;
    }
    .w-full {
      width: 100%;
      margin-bottom: 12px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .half-width {
      flex: 1;
      margin-bottom: 12px;
    }
    .dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e2e8f0;
    }
  `]
})
export class CitaFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<CitaFormDialogComponent>);

  form!: FormGroup;
  isEdit = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: CitaFormDialogData) {}

  ngOnInit(): void {
    this.isEdit = !!this.data.cita;
    const c = this.data.cita;

    // Helper format for datetime-local
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const defaultStart = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours()+1)}:00`;
    const defaultEnd = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours()+2)}:00`;

    this.form = this.fb.group({
      pacienteId: [c?.pacienteId || '', [Validators.required]],
      medicoId: [c?.medicoId || '', [Validators.required]],
      clinicaId: [c?.clinicaId || '', [Validators.required]],
      fechaHoraInicio: [c?.fechaHoraInicio?.substring(0, 16) || defaultStart, [Validators.required]],
      fechaHoraFin: [c?.fechaHoraFin?.substring(0, 16) || defaultEnd, [Validators.required]],
      motivo: [c?.motivo || '', [Validators.required, Validators.maxLength(255)]],
      observaciones: [c?.observaciones || '', [Validators.maxLength(500)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    const req: CitaRequest = {
      pacienteId: val.pacienteId,
      medicoId: val.medicoId,
      clinicaId: val.clinicaId,
      fechaHoraInicio: val.fechaHoraInicio.length === 16 ? `${val.fechaHoraInicio}:00` : val.fechaHoraInicio,
      fechaHoraFin: val.fechaHoraFin.length === 16 ? `${val.fechaHoraFin}:00` : val.fechaHoraFin,
      motivo: val.motivo.trim(),
      observaciones: val.observaciones ? val.observaciones.trim() : undefined
    };
    this.dialogRef.close(req);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
