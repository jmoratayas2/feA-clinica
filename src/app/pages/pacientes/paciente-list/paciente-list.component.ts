import {
  Component, OnInit, OnDestroy, ViewChild,
  inject, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { MatTableModule }             from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule }            from '@angular/material/button';
import { MatIconModule }              from '@angular/material/icon';
import { MatCardModule }              from '@angular/material/card';
import { MatTooltipModule }           from '@angular/material/tooltip';
import { MatProgressSpinnerModule }   from '@angular/material/progress-spinner';
import { MatChipsModule }             from '@angular/material/chips';
import { MatFormFieldModule }         from '@angular/material/form-field';
import { MatInputModule }             from '@angular/material/input';
import { MatSelectModule }            from '@angular/material/select';

import { PacienteService }     from '../../../services/paciente.service';
import { AuthService }         from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Paciente }            from '../../../models/paciente/paciente.model';
import { PacienteFilter }      from '../../../models/paciente-filter.model';
import { PaginationMetadata }  from '../../../models/pagination-metadata.model';

@Component({
  selector: 'app-paciente-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './paciente-list.component.html',
  styleUrl:    './paciente-list.component.css'
})
export class PacienteListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private svc    = inject(PacienteService);
  private auth   = inject(AuthService);
  private notify = inject(NotificationService);
  private fb     = inject(FormBuilder);
  private cdr    = inject(ChangeDetectorRef);

  // ── Estado de la tabla ────────────────────────────────────────────────────
  loading    = true;
  /** Registros de la página actual (NO todos los registros). */
  pacientes: Paciente[] = [];

  /** Metadata de paginación devuelta por el backend. */
  metadata: PaginationMetadata = {
    totalRecords: 0, page: 0, pageSize: 50,
    totalPages: 0, hasPreviousPage: false, hasNextPage: false
  };

  displayedColumns = ['id', 'nombres', 'apellidos', 'telefono', 'correo', 'activo', 'acciones'];
  readonly pageSizeOptions = [50, 100, 200];

  // ── Permisos ──────────────────────────────────────────────────────────────
  get canCreate() { return this.auth.hasPermission('PACIENTE_CREATE'); }
  get canUpdate() { return this.auth.hasPermission('PACIENTE_UPDATE'); }

  // ── Formulario de filtros ─────────────────────────────────────────────────
  filterForm: FormGroup = this.fb.group({
    nombres:              [''],
    apellidos:            [''],
    numeroIdentificacion: [''],
    activo:               [null]   // null = Todos
  });

  // ── Página actual (zero-based, interna) ──────────────────────────────────
  private currentPage = 0;
  private currentSize = 50;

  ngOnInit(): void {
    this.doSearch();
  }

  ngOnDestroy(): void { /* limpieza futura si se agregan Subjects */ }

  // ── Búsqueda ─────────────────────────────────────────────────────────────

  /** Buscar desde la página 0 con los filtros actuales del formulario. */
  search(): void {
    this.currentPage = 0;
    this.doSearch();
  }

  /** Limpiar todos los filtros y volver a la página 0. */
  clearFilters(): void {
    this.filterForm.reset({ nombres: '', apellidos: '', numeroIdentificacion: '', activo: null });
    this.currentPage = 0;
    this.doSearch();
  }

  /** Evento de MatPaginator — cambio de página o tamaño. */
  onPageChange(event: PageEvent): void {
    // Si el usuario cambió el tamaño, volver a la página 0
    if (event.pageSize !== this.currentSize) {
      this.currentSize = event.pageSize;
      this.currentPage = 0;
    } else {
      this.currentPage = event.pageIndex;
    }
    this.doSearch();
  }

  /** Ejecuta la petición HTTP real con los filtros y la página actual. */
  private doSearch(): void {
    this.loading = true;
    this.cdr.markForCheck();

    const formVal = this.filterForm.value;
    const filter: PacienteFilter = {
      page: this.currentPage,
      size: this.currentSize,
      nombres:              formVal.nombres              || undefined,
      apellidos:            formVal.apellidos            || undefined,
      numeroIdentificacion: formVal.numeroIdentificacion || undefined,
      activo:               formVal.activo               ?? undefined,
    };

    this.svc.search(filter).subscribe({
      next: (response) => {
        this.pacientes = response.data;
        this.metadata  = response.metadata;
        this.loading   = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.notify.error('Error', 'No se pudieron cargar los pacientes.');
      }
    });
  }

  // ── Acciones sobre pacientes ──────────────────────────────────────────────

  async onDeactivate(paciente: Paciente): Promise<void> {
    const ok = await this.notify.confirm(
      '¿Desactivar paciente?',
      `Se desactivará a ${paciente.nombres} ${paciente.apellidos}. Esta acción es reversible.`
    );
    if (!ok) return;

    this.svc.deactivate(paciente.id).subscribe({
      next: () => {
        this.notify.success('Paciente desactivado', 'El paciente fue desactivado correctamente.');
        this.doSearch();
      },
      error: () => this.notify.error('Error', 'No se pudo desactivar el paciente.')
    });
  }

  async onActivate(paciente: Paciente): Promise<void> {
    const ok = await this.notify.confirm(
      '¿Reactivar paciente?',
      `Se reactivará a ${paciente.nombres} ${paciente.apellidos}.`
    );
    if (!ok) return;

    this.svc.activate(paciente.id).subscribe({
      next: () => {
        this.notify.success('Paciente reactivado', 'El paciente fue reactivado correctamente.');
        this.doSearch();
      },
      error: () => this.notify.error('Error', 'No se pudo reactivar el paciente.')
    });
  }
}
