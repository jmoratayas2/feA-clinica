import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Consulta, ConsultaRequest, Cita } from '../../../models/clinica-operaciones/operaciones.model';

export interface ConsultaFormDialogData {
  consulta?: Consulta | null;
  citasDisponibles: Cita[];
}

@Component({
  selector: 'app-consulta-form-dialog',
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
      <mat-icon>{{ isEdit ? 'edit_note' : 'assignment' }}</mat-icon>
      {{ isEdit ? 'Editar Consulta Médica' : 'Registrar Consulta Médica' }}
    </h2>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="w-full" *ngIf="!isEdit">
          <mat-label>Cita Asociada (Opcional)</mat-label>
          <mat-select formControlName="citaId">
            <mat-option [value]="null">Sin cita previa / Consulta directa</mat-option>
            <mat-option *ngFor="let c of data.citasDisponibles" [value]="c.id">
              Cita #{{ c.id }} - {{ c.paciente }} (Dr. {{ c.medico }} - {{ c.fechaHoraInicio | date:'dd/MM HH:mm' }})
            </mat-option>
          </mat-select>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Fecha y Hora</mat-label>
            <input matInput type="datetime-local" formControlName="fechaHora">
            <mat-error *ngIf="form.get('fechaHora')?.hasError('required')">Fecha y hora requerida</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Motivo de Consulta</mat-label>
            <input matInput formControlName="motivoConsulta" placeholder="Ej: Dolor torácico, cefalea...">
            <mat-error *ngIf="form.get('motivoConsulta')?.hasError('required')">Motivo requerido</mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Síntomas Referidos</mat-label>
          <textarea matInput formControlName="sintomas" rows="2" placeholder="Descripción de síntomas que reporta el paciente..."></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Examen Físico</mat-label>
          <textarea matInput formControlName="examenFisico" rows="2" placeholder="Signos vitales, hallazgos clínicos, auscultación..."></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Plan General de Tratamiento</mat-label>
          <textarea matInput formControlName="planGeneral" rows="2" placeholder="Plan de manejo, indicaciones y recomendaciones generales..."></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Observaciones Adicionales</mat-label>
          <input matInput formControlName="observaciones" placeholder="Notas adicionales de la atención...">
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="onSubmit()">
        <mat-icon>save</mat-icon> {{ isEdit ? 'Actualizar' : 'Guardar Consulta' }}
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
      min-width: 540px;
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
export class ConsultaFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<ConsultaFormDialogComponent>);

  form!: FormGroup;
  isEdit = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ConsultaFormDialogData) {}

  ngOnInit(): void {
    this.isEdit = !!this.data.consulta;
    const c = this.data.consulta;

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const defaultDate = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    this.form = this.fb.group({
      citaId: [c?.citaId || null],
      fechaHora: [c?.fechaHora?.substring(0, 16) || defaultDate, [Validators.required]],
      motivoConsulta: [c?.motivoConsulta || '', [Validators.required, Validators.maxLength(255)]],
      sintomas: [c?.sintomas || '', [Validators.maxLength(1000)]],
      examenFisico: [c?.examenFisico || '', [Validators.maxLength(1000)]],
      planGeneral: [c?.planGeneral || '', [Validators.maxLength(1000)]],
      observaciones: [c?.observaciones || '', [Validators.maxLength(500)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    const req: ConsultaRequest = {
      citaId: val.citaId || undefined,
      fechaHora: val.fechaHora.length === 16 ? `${val.fechaHora}:00` : val.fechaHora,
      motivoConsulta: val.motivoConsulta.trim(),
      sintomas: val.sintomas ? val.sintomas.trim() : undefined,
      examenFisico: val.examenFisico ? val.examenFisico.trim() : undefined,
      planGeneral: val.planGeneral ? val.planGeneral.trim() : undefined,
      observaciones: val.observaciones ? val.observaciones.trim() : undefined
    };
    this.dialogRef.close(req);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
