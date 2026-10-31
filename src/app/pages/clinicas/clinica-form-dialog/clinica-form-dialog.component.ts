import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Clinica, ClinicaRequest } from '../../../models/clinica/clinica.model';

export interface ClinicaFormDialogData {
  clinica?: Clinica | null;
}

@Component({
  selector: 'app-clinica-form-dialog',
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
      <mat-icon>{{ isEdit ? 'edit' : 'add_business' }}</mat-icon>
      {{ isEdit ? 'Editar Clínica' : 'Nueva Clínica' }}
    </h2>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Nombre de la Clínica</mat-label>
          <input matInput formControlName="nombre" placeholder="Ej: Clínica Central San Lucas">
          <mat-error *ngIf="form.get('nombre')?.hasError('required')">El nombre es obligatorio</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="direccion" placeholder="Ej: 5ta Avenida 12-34 Zona 10">
          <mat-error *ngIf="form.get('direccion')?.hasError('required')">La dirección es obligatoria</mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="telefono" placeholder="Ej: 2234-5678">
            <mat-error *ngIf="form.get('telefono')?.hasError('required')">El teléfono es obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Correo Electrónico</mat-label>
            <input matInput type="email" formControlName="correo" placeholder="Ej: info@clinica.com">
            <mat-error *ngIf="form.get('correo')?.hasError('email')">Correo inválido</mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Horario de Atención</mat-label>
          <input matInput formControlName="horarioAtencion" placeholder="Ej: Lunes a Viernes 07:00 - 18:00">
        </mat-form-field>
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
export class ClinicaFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<ClinicaFormDialogComponent>);

  form!: FormGroup;
  isEdit = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ClinicaFormDialogData) {}

  ngOnInit(): void {
    this.isEdit = !!this.data.clinica;
    const c = this.data.clinica;

    this.form = this.fb.group({
      nombre: [c?.nombre || '', [Validators.required, Validators.maxLength(150)]],
      direccion: [c?.direccion || '', [Validators.required, Validators.maxLength(255)]],
      telefono: [c?.telefono || '', [Validators.required, Validators.maxLength(50)]],
      correo: [c?.correo || '', [Validators.email, Validators.maxLength(100)]],
      horarioAtencion: [c?.horarioAtencion || '', [Validators.maxLength(100)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    const req: ClinicaRequest = {
      nombre: val.nombre.trim(),
      direccion: val.direccion.trim(),
      telefono: val.telefono.trim(),
      correo: val.correo ? val.correo.trim() : undefined,
      horarioAtencion: val.horarioAtencion ? val.horarioAtencion.trim() : undefined
    };
    this.dialogRef.close(req);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
