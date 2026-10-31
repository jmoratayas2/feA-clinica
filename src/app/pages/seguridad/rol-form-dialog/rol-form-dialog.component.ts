import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Rol } from '../../../models/rol/rol.model';
import { RolRequest } from '../../../services/rol.service';

export interface RolFormDialogData {
  rol?: Rol | null;
}

@Component({
  selector: 'app-rol-form-dialog',
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
      <mat-icon>{{ isEdit ? 'edit' : 'badge' }}</mat-icon>
      {{ isEdit ? 'Editar Rol' : 'Nuevo Rol de Sistema' }}
    </h2>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Nombre del Rol</mat-label>
          <input matInput formControlName="nombre" placeholder="Ej: AUDITOR_CLINICO, COORDINADOR...">
          <mat-error *ngIf="form.get('nombre')?.hasError('required')">El nombre del rol es obligatorio</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="descripcion" rows="3" placeholder="Descripción de las responsabilidades y alcance del rol..."></textarea>
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
      min-width: 440px;
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
export class RolFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<RolFormDialogComponent>);

  form!: FormGroup;
  isEdit = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: RolFormDialogData) {}

  ngOnInit(): void {
    this.isEdit = !!this.data.rol;
    const r = this.data.rol;

    this.form = this.fb.group({
      nombre: [r?.nombre || '', [Validators.required, Validators.maxLength(100)]],
      descripcion: [r?.descripcion || '', [Validators.maxLength(255)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    const req: RolRequest = {
      nombre: val.nombre.trim().toUpperCase(),
      descripcion: val.descripcion ? val.descripcion.trim() : undefined,
      idSistema: 1,
      activo: true
    };
    this.dialogRef.close(req);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
