import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TipoExamen, TipoExamenRequest } from '../../../models/examen/examen.model';

export interface TipoExamenDialogData {
  tipo?: TipoExamen | null;
}

@Component({
  selector: 'app-tipo-examen-dialog',
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
      <mat-icon>{{ isEdit ? 'edit' : 'science' }}</mat-icon>
      {{ isEdit ? 'Editar Tipo de Examen' : 'Nuevo Tipo de Examen' }}
    </h2>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Nombre de la Prueba / Examen</mat-label>
          <input matInput formControlName="nombre" placeholder="Ej: Hematología Completa, Perfil Lipídico...">
          <mat-error *ngIf="form.get('nombre')?.hasError('required')">El nombre es obligatorio</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Categoría</mat-label>
          <input matInput formControlName="categoria" placeholder="Ej: Hematología, Bioquímica, Rayos X...">
          <mat-error *ngIf="form.get('categoria')?.hasError('required')">La categoría es obligatoria</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Descripción / Instrucciones</mat-label>
          <textarea matInput formControlName="descripcion" rows="2" placeholder="Requerimientos de toma de muestra, ayuno, etc..."></textarea>
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
    .dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e2e8f0;
    }
  `]
})
export class TipoExamenDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<TipoExamenDialogComponent>);

  form!: FormGroup;
  isEdit = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: TipoExamenDialogData) {}

  ngOnInit(): void {
    this.isEdit = !!this.data.tipo;
    const t = this.data.tipo;

    this.form = this.fb.group({
      nombre: [t?.nombre || '', [Validators.required, Validators.maxLength(150)]],
      categoria: [t?.categoria || '', [Validators.required, Validators.maxLength(100)]],
      descripcion: [t?.descripcion || '', [Validators.maxLength(255)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    const req: TipoExamenRequest = {
      nombre: val.nombre.trim(),
      categoria: val.categoria.trim(),
      descripcion: val.descripcion ? val.descripcion.trim() : undefined
    };
    this.dialogRef.close(req);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
