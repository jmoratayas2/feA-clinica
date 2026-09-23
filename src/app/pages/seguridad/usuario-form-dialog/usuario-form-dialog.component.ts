import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Usuario } from '../../../models/usuario/usuario.model';
import { Rol } from '../../../models/rol/rol.model';

export interface UsuarioFormDialogData {
  usuario?: Usuario | null;
  rolesDisponibles: Rol[];
}

@Component({
  selector: 'app-usuario-form-dialog',
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
  templateUrl: './usuario-form-dialog.component.html',
  styleUrl: './usuario-form-dialog.component.css'
})
export class UsuarioFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<UsuarioFormDialogComponent>);

  form!: FormGroup;
  isEdit = false;
  hidePassword = true;

  constructor(@Inject(MAT_DIALOG_DATA) public data: UsuarioFormDialogData) {}

  ngOnInit(): void {
    this.isEdit = !!this.data.usuario;
    const u = this.data.usuario;

    this.form = this.fb.group({
      username: [
        u?.username || '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(80)]
      ],
      password: [
        '',
        this.isEdit ? [Validators.minLength(8)] : [Validators.required, Validators.minLength(8)]
      ],
      nombres: [u?.nombres || '', [Validators.required, Validators.maxLength(100)]],
      apellidos: [u?.apellidos || '', [Validators.required, Validators.maxLength(100)]],
      email: [u?.email || '', [Validators.required, Validators.email, Validators.maxLength(160)]],
      rolInicial: [null]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const req = {
      username: val.username.trim(),
      password: val.password ? val.password : undefined,
      nombres: val.nombres?.trim() || null,
      apellidos: val.apellidos?.trim() || null,
      email: val.email?.trim() || null
    };

    this.dialogRef.close({
      request: req,
      initialRolId: val.rolInicial
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
