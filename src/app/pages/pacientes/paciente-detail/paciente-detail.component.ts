import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule }     from '@angular/material/card';
import { MatButtonModule }   from '@angular/material/button';
import { MatIconModule }     from '@angular/material/icon';
import { MatDividerModule }  from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule }    from '@angular/material/chips';

import { PacienteService }     from '../../../services/paciente.service';
import { AuthService }         from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Paciente }            from '../../../models/paciente/paciente.model';

@Component({
  selector: 'app-paciente-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './paciente-detail.component.html',
  styleUrl:    './paciente-detail.component.css'
})
export class PacienteDetailComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private svc    = inject(PacienteService);
  private auth   = inject(AuthService);
  private notify = inject(NotificationService);
  private cdr    = inject(ChangeDetectorRef);

  loading  = true;
  paciente: Paciente | null = null;

  get canUpdate() { return this.auth.hasPermission('PACIENTE_UPDATE'); }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getById(id).subscribe({
      next: (p) => {
        this.paciente = p;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.notify.error('Error', 'No se pudo cargar el paciente.');
      }
    });
  }
}
