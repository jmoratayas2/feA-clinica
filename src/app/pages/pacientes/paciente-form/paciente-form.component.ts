import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule }     from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }    from '@angular/material/input';
import { MatSelectModule }   from '@angular/material/select';
import { MatButtonModule }   from '@angular/material/button';
import { MatIconModule }     from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule }  from '@angular/material/divider';

import { PacienteService }     from '../../../services/paciente.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PacienteRequest }     from '../../../models/paciente/paciente-request.model';
import { SexoBiologico, TipoIdentificacion } from '../../../models/paciente/paciente.model';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './paciente-form.component.html',
  styleUrl:    './paciente-form.component.css'
})
export class PacienteFormComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private svc    = inject(PacienteService);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private cdr    = inject(ChangeDetectorRef);

  loading     = false;
  loadingData = false;
  pacienteId: number | null = null;
  get isEdit(): boolean { return this.pacienteId !== null; }

  readonly tiposIdentificacion: TipoIdentificacion[] = ['DPI', 'PASAPORTE', 'NACIMIENTO', 'OTRO'];
  readonly sexosBiologicos: SexoBiologico[]           = ['MASCULINO', 'FEMENINO', 'NO_REGISTRADO'];

  form = this.fb.group({
    nombres:              ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    apellidos:            ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    tipoIdentificacion:   [null as TipoIdentificacion | null],
    numeroIdentificacion: [null as string | null, Validators.maxLength(40)],
    sexoBiologico:        [null as SexoBiologico | null],
    telefono:             [null as string | null, Validators.maxLength(20)],
    correo:               [null as string | null, [Validators.email, Validators.maxLength(255)]],
    direccion:            [null as string | null, Validators.maxLength(255)],
    contactoEmergencia:   [null as string | null, Validators.maxLength(120)],
    telefonoEmergencia:   [null as string | null, Validators.maxLength(20)],
    fechaNacimiento:      ['', Validators.required],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.pacienteId = +idParam;
      this.loadPaciente(this.pacienteId);
    }
  }

  private loadPaciente(id: number): void {
    this.loadingData = true;
    this.cdr.markForCheck();
    this.svc.getById(id).subscribe({
      next: (p) => {
        this.form.patchValue({
          nombres:              p.nombres,
          apellidos:            p.apellidos,
          tipoIdentificacion:   p.tipoIdentificacion,
          numeroIdentificacion: p.numeroIdentificacion,
          sexoBiologico:        p.sexoBiologico,
          telefono:             p.telefono,
          correo:               p.correo,
          direccion:            p.direccion,
          contactoEmergencia:   p.contactoEmergencia,
          telefonoEmergencia:   p.telefonoEmergencia,
          fechaNacimiento:      p.fechaNacimiento,
        });
        this.loadingData = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingData = false;
        this.cdr.markForCheck();
        this.notify.error('Error', 'No se pudo cargar el paciente.');
        this.router.navigate(['/pacientes']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();
    const request = this.form.value as PacienteRequest;

    const op$ = this.isEdit
      ? this.svc.update(this.pacienteId!, request)
      : this.svc.create(request);

    const successMsg = this.isEdit
      ? { title: 'Paciente actualizado', text: 'Los datos fueron actualizados correctamente.' }
      : { title: 'Paciente creado',      text: 'El paciente fue registrado correctamente.' };

    op$.subscribe({
      next: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.notify.success(successMsg.title, successMsg.text);
        this.router.navigate(['/pacientes']);
      },
      error: (err) => {
        this.loading = false;
        this.cdr.markForCheck();
        const msg = err?.error?.message || 'Ocurrió un error al guardar el paciente.';
        this.notify.error('Error', msg);
      }
    });
  }
}
