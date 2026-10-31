import { Component, Inject, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Rol } from '../../../models/rol/rol.model';
import { RolService, RolModuloResponse, ModuloItem, PermisoItem } from '../../../services/rol.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface RolPermisosDialogData {
  rol: Rol;
}

interface ModuloPermisoViewModel {
  modulo: ModuloItem;
  idRolModulo: number | null;
  activo: boolean;
  permisosDisponibles: PermisoItem[];
  permisosSeleccionados: Set<number>; // IDs de permiso
  permisosOriginales: Set<number>;    // Para calcular el diff al guardar
}

@Component({
  selector: 'app-rol-permisos-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatCheckboxModule
  ],
  template: `
    <div class="dialog-header">
      <div class="header-info">
        <div class="role-badge">
          <mat-icon>shield</mat-icon>
          <span>ROL: {{ rol.nombre }}</span>
        </div>
        <h2 class="dialog-title">Gestión de Acciones y Permisos por Módulo</h2>
        <p class="dialog-subtitle">
          Configure exactamente qué operaciones (Ver, Crear, Editar, Cancelar) tiene autorizadas cualquier usuario con el perfil <strong>{{ rol.nombre }}</strong>.
        </p>
      </div>
      <button mat-icon-button mat-dialog-close [disabled]="saving">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <div class="dialog-content">
      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="44"></mat-spinner>
        <p>Cargando matriz de módulos y permisos RBAC...</p>
      </div>

      <div *ngIf="!loading">
        <!-- Barra de acciones rápidas -->
        <div class="quick-toolbar">
          <div class="matrix-summary">
            <span class="summary-pill total-modulos">
              <mat-icon>apps</mat-icon> {{ modulosVM.length }} módulos del sistema
            </span>
            <span class="summary-pill total-activos">
              <mat-icon>check_circle</mat-icon> {{ modulosHabilitadosCount }} módulos activos
            </span>
          </div>

          <div class="quick-actions">
            <button mat-stroked-button (click)="marcarSoloLectura()" [disabled]="saving">
              <mat-icon>visibility</mat-icon> Solo Lectura (Ver)
            </button>
            <button mat-stroked-button (click)="marcarTodos()" [disabled]="saving">
              <mat-icon>done_all</mat-icon> Acceso Total
            </button>
            <button mat-stroked-button color="warn" (click)="desmarcarTodos()" [disabled]="saving">
              <mat-icon>clear_all</mat-icon> Limpiar Todos
            </button>
          </div>
        </div>

        <!-- Lista de tarjetas de módulos -->
        <div class="modules-grid">
          <div
            *ngFor="let m of modulosVM"
            class="module-card"
            [class.card-disabled]="!m.activo"
            [class.card-enabled]="m.activo"
          >
            <!-- Cabecera del módulo -->
            <div class="module-card-header">
              <div class="module-info">
                <div class="module-icon-wrap" [class.icon-active]="m.activo">
                  <mat-icon>{{ m.modulo.icono || 'folder' }}</mat-icon>
                </div>
                <div>
                  <h3 class="module-title">{{ m.modulo.nombre }}</h3>
                  <span class="module-route">{{ m.modulo.ruta || '/' }}</span>
                </div>
              </div>

              <div class="module-toggle">
                <mat-slide-toggle
                  [checked]="m.activo"
                  (change)="toggleModulo(m, $event.checked)"
                  color="primary"
                  [disabled]="saving"
                >
                  {{ m.activo ? 'Habilitado' : 'Deshabilitado' }}
                </mat-slide-toggle>
              </div>
            </div>

            <!-- Permisos granulares de este módulo -->
            <div class="permissions-container" *ngIf="m.activo">
              <div class="permissions-header">
                <span class="section-label">Operaciones permitidas:</span>
                <span class="count-tag">
                  {{ m.permisosSeleccionados.size }} / {{ m.permisosDisponibles.length }} activas
                </span>
              </div>

              <div class="permissions-chips">
                <div
                  *ngFor="let p of m.permisosDisponibles"
                  class="permission-item"
                  [class.perm-selected]="m.permisosSeleccionados.has(p.idPermiso)"
                  [class.perm-read]="esRead(p.codigo)"
                  [class.perm-create]="esCreate(p.codigo)"
                  [class.perm-update]="esUpdate(p.codigo)"
                  [class.perm-danger]="esDanger(p.codigo)"
                  (click)="togglePermiso(m, p.idPermiso)"
                >
                  <mat-checkbox
                    [checked]="m.permisosSeleccionados.has(p.idPermiso)"
                    (click)="$event.stopPropagation()"
                    (change)="togglePermiso(m, p.idPermiso)"
                    [disabled]="saving"
                  ></mat-checkbox>
                  <span class="perm-label">
                    <mat-icon class="perm-icon">{{ getActionIcon(p.codigo) }}</mat-icon>
                    {{ getFriendlyName(p.codigo) }}
                  </span>
                  <span class="perm-code text-muted">({{ p.codigo }})</span>
                </div>
              </div>

              <div *ngIf="m.permisosDisponibles.length === 0" class="no-perms-warning">
                <mat-icon>info</mat-icon>
                <span>Acceso básico a la vista sin operaciones restringidas adicionales.</span>
              </div>
            </div>

            <div class="permissions-disabled-notice" *ngIf="!m.activo">
              <mat-icon>lock</mat-icon>
              <span>El perfil {{ rol.nombre }} no tiene acceso a este módulo.</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dialog-actions">
      <div class="unsaved-notice" *ngIf="tieneCambiosPendientes">
        <mat-icon>edit_note</mat-icon>
        <span>Existen cambios sin guardar</span>
      </div>
      <div class="spacer"></div>

      <button mat-button mat-dialog-close [disabled]="saving">
        Cancelar
      </button>

      <button
        mat-raised-button
        color="primary"
        class="save-btn"
        (click)="guardarCambios()"
        [disabled]="saving || loading || !tieneCambiosPendientes"
      >
        <mat-spinner diameter="18" *ngIf="saving"></mat-spinner>
        <mat-icon *ngIf="!saving">save</mat-icon>
        <span>Guardar Permisos</span>
      </button>
    </div>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px 24px 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      background: #fafbfc;
    }
    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      background: #e0f2fe;
      color: #0284c7;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .role-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .dialog-title {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
    }
    .dialog-subtitle {
      margin: 4px 0 0;
      font-size: 13px;
      color: #64748b;
    }
    .dialog-content {
      padding: 20px 24px;
      max-height: 65vh;
      overflow-y: auto;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 50px 0;
      gap: 16px;
      color: #64748b;
    }
    .quick-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 20px;
      background: #f8fafc;
      padding: 12px 16px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }
    .matrix-summary {
      display: flex;
      gap: 10px;
    }
    .summary-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
    }
    .summary-pill mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .total-modulos {
      background: #e2e8f0;
      color: #334155;
    }
    .total-activos {
      background: #dcfce7;
      color: #15803d;
    }
    .quick-actions {
      display: flex;
      gap: 8px;
    }
    .quick-actions button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 4px;
    }
    .modules-grid {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .module-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #ffffff;
      padding: 16px;
      transition: all 0.2s ease-in-out;
    }
    .module-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .card-disabled {
      background: #fbfbfb;
      opacity: 0.75;
      border-color: #f1f5f9;
    }
    .card-enabled {
      border-color: #cbd5e1;
    }
    .module-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .module-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .module-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #f1f5f9;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .module-icon-wrap.icon-active {
      background: #0284c7;
      color: #ffffff;
    }
    .module-title {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }
    .module-route {
      font-size: 12px;
      color: #94a3b8;
      font-family: monospace;
    }
    .permissions-container {
      background: #f8fafc;
      padding: 12px 14px;
      border-radius: 8px;
      border: 1px solid #f1f5f9;
    }
    .permissions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .section-label {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .count-tag {
      font-size: 11px;
      font-weight: 700;
      color: #0284c7;
      background: #e0f2fe;
      padding: 2px 8px;
      border-radius: 10px;
    }
    .permissions-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .permission-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px 4px 4px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      cursor: pointer;
      user-select: none;
      transition: all 0.15s ease;
      font-size: 13px;
    }
    .permission-item:hover {
      border-color: #94a3b8;
      background: #f1f5f9;
    }
    .perm-selected {
      border-color: #0284c7 !important;
      background: #f0f9ff !important;
      font-weight: 600;
    }
    .perm-icon {
      font-size: 15px;
      width: 15px;
      height: 15px;
      margin-left: 2px;
      vertical-align: middle;
    }
    .perm-label {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #1e293b;
    }
    .perm-code {
      font-size: 10px;
      color: #94a3b8;
    }
    .permissions-disabled-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #94a3b8;
      font-size: 12px;
      font-style: italic;
      padding: 6px 0;
    }
    .permissions-disabled-notice mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .no-perms-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #64748b;
      font-size: 12px;
    }
    .dialog-actions {
      display: flex;
      align-items: center;
      padding: 16px 24px;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      background: #fafbfc;
      gap: 12px;
    }
    .unsaved-notice {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #b45309;
      font-weight: 600;
    }
    .unsaved-notice mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .spacer {
      flex: 1;
    }
    .save-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 20px;
    }
  `]
})
export class RolPermisosDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<RolPermisosDialogComponent>);
  private rolService = inject(RolService);
  private notify = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  rol!: Rol;
  loading = true;
  saving = false;

  modulosVM: ModuloPermisoViewModel[] = [];
  permisosMaestros: PermisoItem[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: RolPermisosDialogData) {
    this.rol = data.rol;
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    forkJoin({
      modulos: this.rolService.listarModulos(),
      permisos: this.rolService.listarPermisos(),
      modulosRol: this.rolService.obtenerModulosDeRol(this.rol.idRol)
    }).subscribe({
      next: ({ modulos, permisos, modulosRol }) => {
        this.permisosMaestros = permisos;
        this.armarMatriz(modulos, permisos, modulosRol);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.notify.error('Error al cargar permisos', err.error?.message || err.message);
        this.cdr.markForCheck();
      }
    });
  }

  private armarMatriz(modulos: ModuloItem[], permisos: PermisoItem[], modulosRol: RolModuloResponse[]): void {
    // Mapa de permisos por código para búsqueda rápida
    const mapaPermisoPorCodigo = new Map<string, PermisoItem>();
    permisos.forEach(p => mapaPermisoPorCodigo.set(p.codigo, p));

    // Mapa de asignación actual del rol
    const mapaRolModulo = new Map<number, RolModuloResponse>();
    modulosRol.forEach(rm => mapaRolModulo.set(rm.idModulo, rm));

    this.modulosVM = modulos
      .filter(m => m.activo !== false)
      .sort((a, b) => (a.orden || 0) - (b.orden || 0))
      .map(m => {
        const asignado = mapaRolModulo.get(m.id);
        const estaActivo = asignado ? Boolean(asignado.activo) : false;
        const idRolModulo = asignado ? asignado.id : null;

        // Determinar qué permisos pertenecen a este módulo según prefijos conocidos
        const permisosDisponibles = this.obtenerPermisosParaModulo(m, permisos);

        const seleccionados = new Set<number>();
        const originales = new Set<number>();

        if (asignado && estaActivo && asignado.permisos) {
          asignado.permisos.forEach(codigo => {
            const p = mapaPermisoPorCodigo.get(codigo);
            if (p) {
              seleccionados.add(p.idPermiso);
              originales.add(p.idPermiso);
            }
          });
        }

        return {
          modulo: m,
          idRolModulo,
          activo: estaActivo,
          permisosDisponibles,
          permisosSeleccionados: seleccionados,
          permisosOriginales: originales
        };
      });
  }

  private obtenerPermisosParaModulo(modulo: ModuloItem, todosPermisos: PermisoItem[]): PermisoItem[] {
    const ruta = modulo.ruta || '';
    const nombre = modulo.nombre.toUpperCase();

    return todosPermisos.filter(p => {
      const code = p.codigo.toUpperCase();

      if (ruta.includes('cita') || nombre.includes('CITA')) {
        return code.startsWith('CITA_');
      }
      if (ruta.includes('paciente') || nombre.includes('PACIENTE')) {
        return code.startsWith('PACIENTE_');
      }
      if (ruta.includes('consulta') || nombre.includes('CONSULTA')) {
        return code.startsWith('CONSULTA_') || code.startsWith('DIAGNOSTICO_') ||
               code.startsWith('TRATAMIENTO_') || code.startsWith('RECETA_');
      }
      if (ruta.includes('examen') || nombre.includes('EXAMEN')) {
        return code.startsWith('EXAMEN_') || code.startsWith('RESULTADO_EXAMEN_');
      }
      if (ruta.includes('medico') || nombre.includes('MEDICO')) {
        return code.startsWith('MEDICO_');
      }
      if (ruta.includes('clinica') || nombre.includes('CLINICA')) {
        return code.startsWith('CLINICA_');
      }
      if (ruta.includes('medicamento') || nombre.includes('MEDICAMENTO')) {
        return code.startsWith('MEDICAMENTO_');
      }
      if (ruta.includes('especialidad') || nombre.includes('ESPECIALIDAD')) {
        return code.startsWith('ESPECIALIDAD_');
      }
      if (ruta.includes('usuario') || nombre.includes('USUARIO')) {
        return code.startsWith('USUARIO_');
      }
      if (ruta.includes('rol') || nombre.includes('ROL')) {
        return code.startsWith('ROL_');
      }
      if (ruta.includes('seguridad') || nombre.includes('SEGURIDAD')) {
        return code.startsWith('SISTEMA_') || code.startsWith('MODULO_') || code.startsWith('PERMISO_');
      }
      return false;
    });
  }

  toggleModulo(vm: ModuloPermisoViewModel, habilitado: boolean): void {
    vm.activo = habilitado;
    if (habilitado) {
      // Por defecto al habilitar un módulo, asignamos permiso de lectura si existe
      const readPerm = vm.permisosDisponibles.find(p => this.esRead(p.codigo));
      if (readPerm && vm.permisosSeleccionados.size === 0) {
        vm.permisosSeleccionados.add(readPerm.idPermiso);
      }
    } else {
      vm.permisosSeleccionados.clear();
    }
    this.cdr.markForCheck();
  }

  togglePermiso(vm: ModuloPermisoViewModel, idPermiso: number): void {
    if (!vm.activo) return;
    if (vm.permisosSeleccionados.has(idPermiso)) {
      vm.permisosSeleccionados.delete(idPermiso);
    } else {
      vm.permisosSeleccionados.add(idPermiso);
    }
    this.cdr.markForCheck();
  }

  marcarSoloLectura(): void {
    this.modulosVM.forEach(vm => {
      vm.activo = true;
      vm.permisosSeleccionados.clear();
      const readPerm = vm.permisosDisponibles.find(p => this.esRead(p.codigo));
      if (readPerm) vm.permisosSeleccionados.add(readPerm.idPermiso);
    });
    this.cdr.markForCheck();
  }

  marcarTodos(): void {
    this.modulosVM.forEach(vm => {
      vm.activo = true;
      vm.permisosSeleccionados.clear();
      vm.permisosDisponibles.forEach(p => vm.permisosSeleccionados.add(p.idPermiso));
    });
    this.cdr.markForCheck();
  }

  desmarcarTodos(): void {
    this.modulosVM.forEach(vm => {
      vm.activo = false;
      vm.permisosSeleccionados.clear();
    });
    this.cdr.markForCheck();
  }

  get modulosHabilitadosCount(): number {
    return this.modulosVM.filter(m => m.activo).length;
  }

  get tieneCambiosPendientes(): boolean {
    return this.modulosVM.some(vm => {
      const eraActivo = vm.permisosOriginales.size > 0 || (vm.idRolModulo !== null && vm.activo);
      if (vm.activo !== eraActivo) return true;
      if (vm.permisosSeleccionados.size !== vm.permisosOriginales.size) return true;
      for (const id of vm.permisosSeleccionados) {
        if (!vm.permisosOriginales.has(id)) return true;
      }
      return false;
    });
  }

  async guardarCambios(): Promise<void> {
    this.saving = true;
    this.cdr.markForCheck();

    try {
      for (const vm of this.modulosVM) {
        const idModulo = vm.modulo.id;

        // 1. Manejo del estado del módulo (Activo / Revocado)
        if (!vm.activo) {
          if (vm.idRolModulo !== null) {
            // Revocar módulo y limpiar permisos
            await this.rolService.revocarModulo(this.rol.idRol, idModulo).toPromise().catch(() => null);
          }
          continue;
        }

        // Si el módulo está activo, asegurarse de que esté asignado
        let idRolModulo = vm.idRolModulo;
        if (!idRolModulo) {
          const res = await this.rolService.asignarModulo(this.rol.idRol, idModulo).toPromise();
          if (res) idRolModulo = res.id;
        }

        if (!idRolModulo) continue;

        // 2. Permisos a revocar (estaban antes pero ya no están seleccionados)
        for (const idPermiso of vm.permisosOriginales) {
          if (!vm.permisosSeleccionados.has(idPermiso)) {
            await this.rolService.revocarPermiso(idRolModulo, idPermiso).toPromise().catch(() => null);
          }
        }

        // 3. Permisos a otorgar (están seleccionados pero no estaban antes)
        for (const idPermiso of vm.permisosSeleccionados) {
          if (!vm.permisosOriginales.has(idPermiso)) {
            await this.rolService.asignarPermiso(idRolModulo, idPermiso).toPromise().catch(() => null);
          }
        }
      }

      this.saving = false;
      this.notify.success(
        'Permisos Guardados Exitosamente',
        `Se actualizaron los permisos para el rol ${this.rol.nombre}. Los usuarios con este rol tendrán sus nuevos privilegios al iniciar sesión.`
      );
      this.dialogRef.close(true);
    } catch (err: any) {
      this.saving = false;
      this.notify.error('Error al guardar', err?.error?.message || err?.message || 'Error inesperado al sincronizar permisos.');
      this.cdr.markForCheck();
    }
  }

  // Helpers de etiquetas y nombres amigables
  esRead(codigo: string): boolean {
    return codigo.endsWith('_READ');
  }
  esCreate(codigo: string): boolean {
    return codigo.endsWith('_CREATE');
  }
  esUpdate(codigo: string): boolean {
    return codigo.endsWith('_UPDATE');
  }
  esDanger(codigo: string): boolean {
    return codigo.endsWith('_CANCEL') || codigo.endsWith('_ANULAR') || codigo.endsWith('_DELETE');
  }

  getActionIcon(codigo: string): string {
    if (this.esRead(codigo)) return 'visibility';
    if (this.esCreate(codigo)) return 'add_circle_outline';
    if (this.esUpdate(codigo)) return 'edit_note';
    if (this.esDanger(codigo)) return 'cancel';
    return 'key';
  }

  getFriendlyName(codigo: string): string {
    if (this.esRead(codigo)) return 'Ver / Consultar';
    if (this.esCreate(codigo)) return 'Crear / Registrar';
    if (this.esUpdate(codigo)) return 'Editar / Modificar';
    if (this.esDanger(codigo)) return 'Cancelar / Anular';

    // Diagnósticos, recetas, etc.
    if (codigo.includes('DIAGNOSTICO_READ')) return 'Ver Diagnósticos';
    if (codigo.includes('DIAGNOSTICO_CREATE')) return 'Crear Diagnósticos';
    if (codigo.includes('TRATAMIENTO_READ')) return 'Ver Tratamientos';
    if (codigo.includes('TRATAMIENTO_CREATE')) return 'Crear Tratamientos';
    if (codigo.includes('TRATAMIENTO_UPDATE')) return 'Editar Tratamientos';
    if (codigo.includes('RECETA_READ')) return 'Ver Recetas';
    if (codigo.includes('RECETA_CREATE')) return 'Crear Recetas';
    if (codigo.includes('RECETA_ANULAR')) return 'Anular Recetas';
    if (codigo.includes('RESULTADO_EXAMEN_READ')) return 'Ver Resultados Examen';
    if (codigo.includes('RESULTADO_EXAMEN_CREATE')) return 'Registrar Resultados';

    return codigo;
  }
}
