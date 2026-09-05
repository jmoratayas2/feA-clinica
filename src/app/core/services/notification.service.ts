import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

/**
 * NotificationService encapsula SweetAlert2.
 * No usar Swal.fire() directamente en componentes.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {

  success(title: string, text?: string): void {
    Swal.fire({
      icon:              'success',
      title,
      text,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3F51B5',
      timer:             3000,
      timerProgressBar:  true,
    });
  }

  error(title: string, text?: string): void {
    Swal.fire({
      icon:              'error',
      title,
      text,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#3F51B5',
    });
  }

  warning(title: string, text?: string): void {
    Swal.fire({
      icon:              'warning',
      title,
      text,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3F51B5',
    });
  }

  info(title: string, text?: string): void {
    Swal.fire({
      icon:              'info',
      title,
      text,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3F51B5',
    });
  }

  /**
   * Muestra un diálogo de confirmación.
   * @returns Promise<boolean> — true si el usuario confirmó.
   */
  async confirm(title: string, text?: string): Promise<boolean> {
    const result: SweetAlertResult = await Swal.fire({
      icon:                'question',
      title,
      text,
      showCancelButton:    true,
      confirmButtonText:   'Sí, continuar',
      cancelButtonText:    'Cancelar',
      confirmButtonColor:  '#3F51B5',
      cancelButtonColor:   '#9e9e9e',
      reverseButtons:      true,
    });
    return result.isConfirmed;
  }

  /** Sesión expirada: limpia y redirige (el componente se encarga de llamar logout). */
  sessionExpired(): void {
    Swal.fire({
      icon:              'warning',
      title:             'Sesión expirada',
      text:              'Su sesión ha expirado. Inicie sesión nuevamente.',
      confirmButtonText: 'Iniciar sesión',
      confirmButtonColor: '#3F51B5',
      allowOutsideClick: false,
    });
  }

  accessDenied(): void {
    Swal.fire({
      icon:              'error',
      title:             'Acceso denegado',
      text:              'No posee permisos para realizar esta operación.',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#3F51B5',
    });
  }
}
