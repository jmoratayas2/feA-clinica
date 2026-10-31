import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Medicamento, MedicamentoRequest } from '../../../models/medicamento/medicamento.model';

export interface MedicamentoFormDialogData {
  medicamento?: Medicamento | null;
}

@Component({
  selector: 'app-medicamento-form-dialog',
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
      <mat-icon>{{ isEdit ? 'edit' : 'medication' }}</mat-icon>
      {{ isEdit ? 'Editar Medicamento' : 'Nuevo Medicamento' }}
    </h2>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Nombre Genérico</mat-label>
          <input matInput formControlName="nombreGenerico" placeholder="Ej: Paracetamol, Amoxicilina...">
          <mat-error *ngIf="form.get('nombreGenerico')?.hasError('required')">El nombre genérico es obligatorio</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Nombre Comercial (Opcional)</mat-label>
          <input matInput formControlName="nombreComercial" placeholder="Ej: Panadol, Amoxil...">
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Presentación</mat-label>
            <input matInput formControlName="presentacion" placeholder="Ej: Tabletas, Jarabe, Ampolla...">
            <mat-error *ngIf="form.get('presentacion')?.hasError('required')">La presentación es obligatoria</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Concentración</mat-label>
            <input matInput formControlName="concentracion" placeholder="Ej: 500 mg, 250 mg / 5 ml...">
            <mat-error *ngIf="form.get('concentracion')?.hasError('required')">La concentración es obligatoria</mat-error>
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
export class MedicamentoFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<MedicamentoFormDialogComponent>);

  form!: FormGroup;
  isEdit = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: MedicamentoFormDialogData) {}

  ngOnInit(): void {
    this.isEdit = !!this.data.medicamento;
    const m = this.data.medicamento;

    this.form = this.fb.group({
      nombreGenerico: [m?.nombreGenerico || '', [Validators.required, Validators.maxLength(150)]],
      nombreComercial: [m?.nombreComercial || '', [Validators.maxLength(150)]],
      presentacion: [m?.presentacion || '', [Validators.required, Validators.maxLength(100)]],
      concentracion: [m?.concentracion || '', [Validators.required, Validators.maxLength(100)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    const req: MedicamentoRequest = {
      nombreGenerico: val.nombreGenerico.trim(),
      nombreComercial: val.nombreComercial ? val.nombreComercial.trim() : undefined,
      presentacion: val.presentacion.trim(),
      concentracion: val.concentracion.trim()
    };
    this.dialogRef.close(req);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
