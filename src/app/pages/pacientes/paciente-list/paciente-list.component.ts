import { Component, OnInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule }  from '@angular/material/button';
import { MatIconModule }    from '@angular/material/icon';
import { MatCardModule }    from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule }   from '@angular/material/chips';

import { PacienteService }     from '../../../services/paciente.service';
import { AuthService }         from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Paciente }            from '../../../models/paciente/paciente.model';

@Component({
  selector: 'app-paciente-list',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './paciente-list.component.html',
  styleUrl:    './paciente-list.component.css'
})
export class PacienteListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)      sort!:      MatSort;

  private svc    = inject(PacienteService);
  private auth   = inject(AuthService);
  private notify = inject(NotificationService);
  private cdr    = inject(ChangeDetectorRef);

  loading = true;
  dataSource = new MatTableDataSource<Paciente>([]);

  displayedColumns = ['id', 'nombres', 'apellidos', 'telefono', 'correo', 'activo', 'acciones'];

  get canCreate() { return this.auth.hasPermission('PACIENTE_CREATE'); }
  get canUpdate() { return this.auth.hasPermission('PACIENTE_UPDATE'); }

  ngOnInit(): void {
    this.loadPacientes();
  }

  loadPacientes(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.svc.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort      = this.sort;
        });
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.notify.error('Error', 'No se pudieron cargar los pacientes.');
      }
    });
  }

  applyFilter(event: Event): void {
    const val = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = val;
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  async onDeactivate(paciente: Paciente): Promise<void> {
    const ok = await this.notify.confirm(
      '¿Desactivar paciente?',
      `Se desactivará a ${paciente.nombres} ${paciente.apellidos}. Esta acción es reversible.`
    );
    if (!ok) return;

    this.svc.deactivate(paciente.id).subscribe({
      next: () => {
        this.notify.success('Paciente desactivado', 'El paciente fue desactivado correctamente.');
        this.loadPacientes();
      },
      error: () => this.notify.error('Error', 'No se pudo desactivar el paciente.')
    });
  }

  async onActivate(paciente: Paciente): Promise<void> {
    const ok = await this.notify.confirm('¿Reactivar paciente?', `Se reactivará a ${paciente.nombres} ${paciente.apellidos}.`);
    if (!ok) return;

    this.svc.activate(paciente.id).subscribe({
      next: () => {
        this.notify.success('Paciente reactivado', 'El paciente fue reactivado correctamente.');
        this.loadPacientes();
      },
      error: () => this.notify.error('Error', 'No se pudo reactivar el paciente.')
    });
  }
}
