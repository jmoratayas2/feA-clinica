import { Component, inject, ChangeDetectorRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
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
import { environment }         from '../../../../environments/environment';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: any) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

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
export class LoginComponent implements AfterViewInit, OnDestroy {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private cdr    = inject(ChangeDetectorRef);

  loading        = false;
  hidePassword   = true;
  turnstileToken: string | null = null;
  turnstileWidgetId: string | null = null;
  private turnstileInterval: any = null;

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(2)]],
    password: ['', [Validators.required, Validators.minLength(3)]],
  });

  get username() { return this.form.get('username')!; }
  get password() { return this.form.get('password')!; }

  ngAfterViewInit(): void {
    this.initTurnstile();
  }

  ngOnDestroy(): void {
    if (this.turnstileInterval) {
      clearInterval(this.turnstileInterval);
    }
  }

  private initTurnstile(): void {
    // Si la API de Turnstile ya está cargada
    if (window.turnstile) {
      this.renderWidget();
      return;
    }

    // Esperar a que el script termine de cargar
    let attempts = 0;
    this.turnstileInterval = setInterval(() => {
      attempts++;
      if (window.turnstile) {
        clearInterval(this.turnstileInterval);
        this.renderWidget();
      } else if (attempts > 30) {
        clearInterval(this.turnstileInterval);
      }
    }, 200);
  }

  private renderWidget(): void {
    const container = document.getElementById('turnstile-container');
    if (!container || !window.turnstile || this.turnstileWidgetId) return;

    try {
      this.turnstileWidgetId = window.turnstile.render('#turnstile-container', {
        sitekey: environment.turnstileSiteKey || '1x00000000000000000000AA',
        theme: 'light',
        callback: (token: string) => {
          this.turnstileToken = token;
          this.cdr.markForCheck();
        },
        'expired-callback': () => {
          this.turnstileToken = null;
          this.cdr.markForCheck();
        },
        'error-callback': () => {
          this.turnstileToken = null;
          this.cdr.markForCheck();
        }
      });
    } catch (e) {
      console.warn('Error al inicializar Cloudflare Turnstile:', e);
    }
  }

  private resetTurnstile(): void {
    if (window.turnstile && this.turnstileWidgetId) {
      try {
        window.turnstile.reset(this.turnstileWidgetId);
        this.turnstileToken = null;
      } catch (e) {
        // Ignorar
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.turnstileToken) {
      this.notify.warning(
        'Verificación de seguridad',
        'Por favor complete la verificación de Turnstile / CAPTCHA antes de iniciar sesión.'
      );
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.auth.login({
      username: this.username.value!,
      password: this.password.value!,
      turnstileToken: this.turnstileToken,
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
        this.resetTurnstile();
        this.cdr.markForCheck();

        // 1. Rate Limiting (HTTP 429)
        if (err.status === 429) {
          const msg = err.error?.message || 'Demasiadas solicitudes. Límite de 10 peticiones por minuto excedido.';
          this.notify.error('Límite de solicitudes (Rate Limit)', msg);
          return;
        }

        // 2. Bloqueo temporal por intentos fallidos (HTTP 423)
        if (err.status === 423 || err.error?.error === 'ACCOUNT_LOCKED') {
          const msg = err.error?.message || 'Cuenta bloqueada temporalmente durante 15 minutos debido a 5 intentos fallidos consecutivos.';
          this.notify.error('Cuenta Bloqueada (15 min)', msg);
          return;
        }

        // 3. Fallo de validación de Turnstile / CAPTCHA (HTTP 400 CAPTCHA_FAILED)
        if (err.error?.error === 'CAPTCHA_FAILED') {
          this.notify.error('Verificación de Seguridad', err.error?.message || 'Validación de Turnstile / CAPTCHA fallida.');
          return;
        }

        // 4. Intentos fallidos / Contraseña incorrecta (HTTP 401)
        if (err.status === 401) {
          const msg = err.error?.message || 'Usuario o contraseña incorrectos.';
          this.notify.error('Error de autenticación', msg);
          return;
        }

        if (err.status === 400) {
          this.notify.error('Solicitud inválida', err.error?.message || 'Por favor verifique los datos ingresados.');
          return;
        }

        this.notify.error(
          'Error de conexión',
          'No se pudo conectar con el servidor. Intente nuevamente.'
        );
      }
    });
  }
}
