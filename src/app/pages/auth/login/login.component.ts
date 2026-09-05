import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule }     from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }    from '@angular/material/input';
import { MatButtonModule }   from '@angular/material/button';
import { MatIconModule }     from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService }         from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl:    './login.component.css'
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private cdr    = inject(ChangeDetectorRef);

  loading        = false;
  hidePassword   = true;

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(2)]],
    password: ['', [Validators.required, Validators.minLength(3)]],
  });

  get username() { return this.form.get('username')!; }
  get password() { return this.form.get('password')!; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.auth.login({
      username: this.username.value!,
      password: this.password.value!,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.notify.success(
          '¡Bienvenido!',
          `Sesión iniciada como ${this.auth.getUsername()}`
        );
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.cdr.markForCheck();
        if (err.status === 401 || err.status === 400) {
          this.notify.error(
            'Error de autenticación',
            'Usuario o contraseña incorrectos.'
          );
        } else {
          this.notify.error(
            'Error de conexión',
            'No se pudo conectar con el servidor. Intente nuevamente.'
          );
        }
      }
    });
  }
}
