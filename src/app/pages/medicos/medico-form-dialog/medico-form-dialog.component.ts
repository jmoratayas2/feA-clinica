import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { Medico, MedicoRequest } from '../../../models/medico/medico.model';

export interface MedicoFormDialogData {
  medico?: Medico | null;
}

export interface MedicoFormDialogResult {
  medicoRequest: MedicoRequest;
  crearUsuario: boolean;
  usuarioData?: {
    username: string;
    password?: string;
    nombres: string;
    apellidos: string;
    email: string;
  } | null;
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
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon>{{ isEdit ? 'edit' : 'medical_services' }}</mat-icon>
      {{ isEdit ? 'Editar Médico' : 'Nuevo Médico' }}
    </h2>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <p class="section-hint">Datos Profesionales del Médico (Catálogo Clínico)</p>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Nombres</mat-label>
            <input matInput formControlName="nombres" placeholder="Ej: Carlos Eduardo" (blur)="autoSugerirUsername()">
            <mat-error *ngIf="form.get('nombres')?.hasError('required')">Los nombres son obligatorios</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Apellidos</mat-label>
            <input matInput formControlName="apellidos" placeholder="Ej: Gómez Martínez" (blur)="autoSugerirUsername()">
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

        <!-- Sección de Credenciales de Acceso (Usuario de Sistema) -->
        <div *ngIf="!isEdit" class="access-section">
          <mat-divider style="margin: 16px 0;"></mat-divider>
          <mat-checkbox formControlName="crearUsuario" color="primary" class="checkbox-user">
            <b>Crear también cuenta de usuario en el sistema para este médico</b>
          </mat-checkbox>
          <p class="access-hint">Permite al médico iniciar sesión con su propio usuario y contraseña.</p>

          <div *ngIf="form.get('crearUsuario')?.value" class="credentials-box">
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Nombre de Usuario</mat-label>
                <mat-icon matPrefix>person</mat-icon>
                <input matInput formControlName="username" placeholder="Ej: dr.carlosg">
                <mat-error *ngIf="form.get('username')?.hasError('required')">El usuario es requerido</mat-error>
                <mat-error *ngIf="form.get('username')?.hasError('minlength')">Mínimo 3 caracteres</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Contraseña</mat-label>
                <mat-icon matPrefix>lock</mat-icon>
                <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Mínimo 8 caracteres">
                <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="form.get('password')?.hasError('required')">La contraseña es requerida</mat-error>
                <mat-error *ngIf="form.get('password')?.hasError('minlength')">Mínimo 8 caracteres</mat-error>
              </mat-form-field>
            </div>
          </div>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="onSubmit()">
        <mat-icon>save</mat-icon> Guardar Médico
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
    .section-hint {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0 0 12px 0;
      font-weight: 500;
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
    .access-section {
      margin-top: 8px;
    }
    .checkbox-user {
      display: block;
      margin-bottom: 4px;
    }
    .access-hint {
      margin: 0 0 12px 28px;
      font-size: 0.8rem;
      color: #64748b;
    }
    .credentials-box {
      background: #f8fafc;
      padding: 16px 16px 4px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      margin-top: 8px;
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
  hidePassword = true;

  constructor(@Inject(MAT_DIALOG_DATA) public data: MedicoFormDialogData) {}

  ngOnInit(): void {
    this.isEdit = !!this.data.medico;
    const m = this.data.medico;

    this.form = this.fb.group({
      nombres: [m?.nombres || '', [Validators.required, Validators.maxLength(100)]],
      apellidos: [m?.apellidos || '', [Validators.required, Validators.maxLength(100)]],
      numeroColegiado: [m?.numeroColegiado || '', [Validators.required, Validators.maxLength(50)]],
      telefono: [m?.telefono || '', [Validators.maxLength(50)]],
      correo: [m?.correo || '', [Validators.email, Validators.maxLength(100)]],
      crearUsuario: [!this.isEdit],
      username: [''],
      password: ['']
    });

    this.actualizarValidadoresUsuario(!this.isEdit);

    this.form.get('crearUsuario')?.valueChanges.subscribe((crear: boolean) => {
      this.actualizarValidadoresUsuario(crear);
    });
  }

  private actualizarValidadoresUsuario(crear: boolean): void {
    const userCtrl = this.form.get('username');
    const passCtrl = this.form.get('password');
    if (crear && !this.isEdit) {
      userCtrl?.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(80)]);
      passCtrl?.setValidators([Validators.required, Validators.minLength(8)]);
    } else {
      userCtrl?.clearValidators();
      passCtrl?.clearValidators();
    }
    userCtrl?.updateValueAndValidity();
    passCtrl?.updateValueAndValidity();
  }

  autoSugerirUsername(): void {
    if (this.isEdit || !this.form.get('crearUsuario')?.value) return;
    const userCtrl = this.form.get('username');
    if (!userCtrl?.value) {
      const nombres = (this.form.get('nombres')?.value || '').trim().toLowerCase().split(' ')[0];
      const apellidos = (this.form.get('apellidos')?.value || '').trim().toLowerCase().split(' ')[0];
      if (nombres && apellidos) {
        userCtrl?.setValue(`dr.${nombres}.${apellidos}`.replace(/[^a-z0-9._]/g, ''));
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    const medicoRequest: MedicoRequest = {
      nombres: val.nombres.trim(),
      apellidos: val.apellidos.trim(),
      numeroColegiado: val.numeroColegiado.trim(),
      telefono: val.telefono ? val.telefono.trim() : undefined,
      correo: val.correo ? val.correo.trim() : undefined
    };

    const result: MedicoFormDialogResult = {
      medicoRequest,
      crearUsuario: !!val.crearUsuario && !this.isEdit,
      usuarioData: (val.crearUsuario && !this.isEdit) ? {
        username: val.username.trim(),
        password: val.password,
        nombres: val.nombres.trim(),
        apellidos: val.apellidos.trim(),
        email: val.correo ? val.correo.trim() : `${val.username.trim()}@clinica.com`
      } : null
    };

    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
