import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MenuModulo } from '../../models/menu/menu-modulo.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private http = inject(HttpClient);
  private menuUrl = `${environment.securityApiUrl}/api/security/usuarios/me/menu`;

  getMenu(): Observable<MenuModulo[]> {
    return this.http.get<MenuModulo[]>(this.menuUrl).pipe(
      tap(modulos => {
        console.log(`[MenuService] ${modulos.length} módulos recibidos para el usuario autenticado:`, modulos);
      }),
      catchError(err => {
        console.error('[MenuService] Error al cargar el menú dinámico de accesos:', err);
        return of([]);
      })
    );
  }
}
