import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Medico, MedicoRequest } from '../../../models/medico/medico.model';

export interface MedicoFormDialogData {
  medico?: Medico | null;
}

@Component({
  selector: 'app-medico-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon>{{ isEdit ? 'edit' : 'medical_services' }}</mat-icon>
      {{ isEdit ? 'Editar Médico' : 'Nuevo Médico' }}
    </h2>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Nombres</mat-label>
            <input matInput formControlName="nombres" placeholder="Ej: Carlos Eduardo">
            <mat-error *ngIf="form.get('nombres')?.hasError('required')">Los nombres son obligatorios</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Apellidos</mat-label>
            <input matInput formControlName="apellidos" placeholder="Ej: Gómez Martínez">
            <mat-error *ngIf="form.get('apellidos')?.hasError('required')">Los apellidos son obligatorios</mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>No. de Colegiado Médico</mat-label>
          <input matInput formControlName="numeroColegiado" placeholder="Ej: COL-12984">
          <mat-error *ngIf="form.get('numeroColegiado')?.hasError('required')">El colegiado es obligatorio</mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="telefono" placeholder="Ej: 5544-3322">
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Correo Electrónico</mat-label>
            <input matInput type="email" formControlName="correo" placeholder="Ej: dr.gomez@clinica.com">
            <mat-error *ngIf="form.get('correo')?.hasError('email')">Correo inválido</mat-error>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="onSubmit()">
        <mat-icon>save</mat-icon> Guardar
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
      min-width: 480px;
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
export class MedicoFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<MedicoFormDialogComponent>);

  form!: FormGroup;
  isEdit = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: MedicoFormDialogData) {}

  ngOnInit(): void {
    this.isEdit = !!this.data.medico;
    const m = this.data.medico;

    this.form = this.fb.group({
      nombres: [m?.nombres || '', [Validators.required, Validators.maxLength(100)]],
      apellidos: [m?.apellidos || '', [Validators.required, Validators.maxLength(100)]],
      numeroColegiado: [m?.numeroColegiado || '', [Validators.required, Validators.maxLength(50)]],
      telefono: [m?.telefono || '', [Validators.maxLength(50)]],
      correo: [m?.correo || '', [Validators.email, Validators.maxLength(100)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    const req: MedicoRequest = {
      nombres: val.nombres.trim(),
      apellidos: val.apellidos.trim(),
      numeroColegiado: val.numeroColegiado.trim(),
      telefono: val.telefono ? val.telefono.trim() : undefined,
      correo: val.correo ? val.correo.trim() : undefined
    };
    this.dialogRef.close(req);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
