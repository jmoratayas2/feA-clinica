import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { ConsultaService } from '../../../services/consulta.service';
import { CatalogosService } from '../../../services/catalogos.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  Consulta,
  Diagnostico,
  DiagnosticoRequest,
  Tratamiento,
  TratamientoRequest,
  Receta,
  RecetaRequest,
  DetalleRecetaRequest
} from '../../../models/clinica-operaciones/operaciones.model';
import { Medicamento } from '../../../models/medicamento/medicamento.model';
import { TipoExamen, Examen, ExamenRequest } from '../../../models/examen/examen.model';

export interface ConsultaDetailDialogData {
  consulta: Consulta;
}

@Component({
  selector: 'app-consulta-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="dialog-header">
      <div class="header-titles">
        <h2 class="title"><mat-icon>assignment</mat-icon> Expediente de Consulta #{{ data.consulta.id }}</h2>
        <span class="subtitle">Fecha: {{ data.consulta.fechaHora | date:'dd/MM/yyyy HH:mm' }}</span>
      </div>
      <button mat-icon-button (click)="dialogRef.close()"><mat-icon>close</mat-icon></button>
    </div>

    <mat-dialog-content class="dialog-body">
      <mat-tab-group animationDuration="200ms">
        <!-- Tab 1: Resumen Clínico -->
        <mat-tab label="Resumen Clínico">
          <div class="tab-pane">
            <div class="section-card">
              <h3 class="section-title"><mat-icon>help_outline</mat-icon> Motivo de Consulta</h3>
              <p class="section-text">{{ data.consulta.motivoConsulta }}</p>
            </div>

            <div class="section-card" *ngIf="data.consulta.sintomas">
              <h3 class="section-title"><mat-icon>record_voice_over</mat-icon> Síntomas</h3>
              <p class="section-text">{{ data.consulta.sintomas }}</p>
            </div>

            <div class="section-card" *ngIf="data.consulta.examenFisico">
              <h3 class="section-title"><mat-icon>healing</mat-icon> Examen Físico</h3>
              <p class="section-text">{{ data.consulta.examenFisico }}</p>
            </div>

            <div class="section-card" *ngIf="data.consulta.planGeneral">
              <h3 class="section-title"><mat-icon>playlist_add_check</mat-icon> Plan General</h3>
              <p class="section-text">{{ data.consulta.planGeneral }}</p>
            </div>
          </div>
        </mat-tab>

        <!-- Tab 2: Diagnósticos -->
        <mat-tab [label]="'Diagnósticos (' + diagnosticos.length + ')'">
          <div class="tab-pane">
            <div class="form-box">
              <h4>Agregar Diagnóstico</h4>
              <form [formGroup]="formDiag" (ngSubmit)="agregarDiagnostico()" class="grid-form">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Descripción del diagnóstico</mat-label>
                  <input matInput formControlName="descripcion" placeholder="Ej: Faringoamigdalitis aguda">
                </mat-form-field>

                <div class="flex-row">
                  <mat-form-field appearance="outline" class="half">
                    <mat-label>Código CIE-10 (Opcional)</mat-label>
                    <input matInput formControlName="codigoCie10" placeholder="Ej: J03.9">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half">
                    <mat-label>Tipo</mat-label>
                    <mat-select formControlName="tipo">
                      <mat-option value="PRESUNTIVO">PRESUNTIVO</mat-option>
                      <mat-option value="DEFINITIVO">DEFINITIVO</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <button mat-raised-button color="primary" [disabled]="formDiag.invalid" type="submit">
                  <mat-icon>add</mat-icon> Registrar Diagnóstico
                </button>
              </form>
            </div>

            <div class="list-container">
              <div *ngFor="let d of diagnosticos" class="item-card">
                <div>
                  <div class="item-title">
                    {{ d.descripcion }}
                    <span class="badge-cie" *ngIf="d.codigoCie10">CIE-10: {{ d.codigoCie10 }}</span>
                  </div>
                  <div class="item-meta">Tipo: <strong>{{ d.tipo }}</strong></div>
                </div>
              </div>
              <p *ngIf="diagnosticos.length === 0" class="empty-msg">No hay diagnósticos registrados para esta consulta.</p>
            </div>
          </div>
        </mat-tab>

        <!-- Tab 3: Tratamientos -->
        <mat-tab [label]="'Tratamientos (' + tratamientos.length + ')'">
          <div class="tab-pane">
            <div class="form-box">
              <h4>Indicar Tratamiento</h4>
              <form [formGroup]="formTrat" (ngSubmit)="agregarTratamiento()" class="grid-form">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Descripción</mat-label>
                  <input matInput formControlName="descripcion" placeholder="Ej: Reposo relativo e hidratación oral">
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Indicaciones</mat-label>
                  <textarea matInput formControlName="indicaciones" rows="2" placeholder="Tomar abundantes líquidos, evitar exposición al frío..."></textarea>
                </mat-form-field>

                <div class="flex-row">
                  <mat-form-field appearance="outline" class="half">
                    <mat-label>Fecha Inicio</mat-label>
                    <input matInput type="date" formControlName="fechaInicio">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half">
                    <mat-label>Estado</mat-label>
                    <mat-select formControlName="estado">
                      <mat-option value="ACTIVO">ACTIVO</mat-option>
                      <mat-option value="SUSPENDIDO">SUSPENDIDO</mat-option>
                      <mat-option value="FINALIZADO">FINALIZADO</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <button mat-raised-button color="primary" [disabled]="formTrat.invalid" type="submit">
                  <mat-icon>add</mat-icon> Registrar Tratamiento
                </button>
              </form>
            </div>

            <div class="list-container">
              <div *ngFor="let t of tratamientos" class="item-card">
                <div>
                  <div class="item-title">{{ t.descripcion }}</div>
                  <div class="item-desc">{{ t.indicaciones }}</div>
                  <div class="item-meta">Desde: {{ t.fechaInicio }} | Estado: <strong>{{ t.estado }}</strong></div>
                </div>
              </div>
              <p *ngIf="tratamientos.length === 0" class="empty-msg">No hay tratamientos registrados para esta consulta.</p>
            </div>
          </div>
        </mat-tab>

        <!-- Tab 4: Recetas -->
        <mat-tab [label]="'Recetas (' + recetas.length + ')'">
          <div class="tab-pane">
            <div class="form-box">
              <h4>Emitir Receta Médica</h4>
              <form [formGroup]="formReceta" (ngSubmit)="agregarReceta()" class="grid-form">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Medicamento</mat-label>
                  <mat-select formControlName="medicamentoId">
                    <mat-option *ngFor="let m of medicamentos" [value]="m.id">
                      {{ m.nombreGenerico }} ({{ m.presentacion }} - {{ m.concentracion }})
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="flex-row">
                  <mat-form-field appearance="outline" class="half">
                    <mat-label>Dosis</mat-label>
                    <input matInput formControlName="dosis" placeholder="Ej: 1 tableta">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half">
                    <mat-label>Frecuencia</mat-label>
                    <input matInput formControlName="frecuencia" placeholder="Ej: Cada 8 horas">
                  </mat-form-field>
                </div>

                <div class="flex-row">
                  <mat-form-field appearance="outline" class="half">
                    <mat-label>Duración</mat-label>
                    <input matInput formControlName="duracion" placeholder="Ej: Por 5 días">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half">
                    <mat-label>Vía de Administración</mat-label>
                    <input matInput formControlName="viaAdministracion" placeholder="Ej: Oral">
                  </mat-form-field>
                </div>

                <button mat-raised-button color="primary" [disabled]="formReceta.invalid" type="submit">
                  <mat-icon>medication</mat-icon> Emitir Receta
                </button>
              </form>
            </div>

            <div class="list-container">
              <div *ngFor="let r of recetas" class="item-card">
                <div>
                  <div class="item-title">Receta #{{ r.id }} - Estado: {{ r.estado }}</div>
                  <div class="item-meta">Emisión: {{ r.fechaEmision | date:'dd/MM/yyyy HH:mm' }}</div>
                  <div *ngFor="let det of r.detalles" class="item-desc">
                    💊 <strong>{{ det.medicamento }}</strong>: {{ det.dosis }} {{ det.frecuencia }} ({{ det.duracion }}) - Vía: {{ det.viaAdministracion }}
                  </div>
                </div>
              </div>
              <p *ngIf="recetas.length === 0" class="empty-msg">No hay recetas emitidas para esta consulta.</p>
            </div>
          </div>
        </mat-tab>

        <!-- Tab 5: Exámenes Solicitados -->
        <mat-tab [label]="'Exámenes (' + examenes.length + ')'">
          <div class="tab-pane">
            <div class="form-box">
              <h4>Solicitar Orden de Examen</h4>
              <form [formGroup]="formExamen" (ngSubmit)="solicitarExamen()" class="grid-form">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Tipo de Examen</mat-label>
                  <mat-select formControlName="tipoExamenId">
                    <mat-option *ngFor="let te of tiposExamen" [value]="te.id">
                      {{ te.nombre }} ({{ te.categoria }})
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Prioridad</mat-label>
                  <mat-select formControlName="prioridad">
                    <mat-option value="BAJA">BAJA</mat-option>
                    <mat-option value="MEDIA">MEDIA</mat-option>
                    <mat-option value="ALTA">ALTA</mat-option>
                    <mat-option value="URGENTE">URGENTE</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Indicaciones Clínicas para Laboratorio</mat-label>
                  <textarea matInput formControlName="indicaciones" rows="2" placeholder="Ayuno 8 horas, primera orina de la mañana..."></textarea>
                </mat-form-field>

                <button mat-raised-button color="primary" [disabled]="formExamen.invalid" type="submit">
                  <mat-icon>science</mat-icon> Solicitar Examen
                </button>
              </form>
            </div>

            <div class="list-container">
              <div *ngFor="let ex of examenes" class="item-card">
                <div>
                  <div class="item-title">{{ ex.tipoExamen }}</div>
                  <div class="item-meta">
                    Prioridad: <strong>{{ ex.prioridad }}</strong> | Estado: <strong>{{ ex.estado }}</strong>
                  </div>
                  <div class="item-desc" *ngIf="ex.indicaciones">Notas: {{ ex.indicaciones }}</div>
                </div>
              </div>
              <p *ngIf="examenes.length === 0" class="empty-msg">No hay órdenes de exámenes solicitadas.</p>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: #1e3a8a;
      color: white;
    }
    .title {
      margin: 0;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .subtitle {
      font-size: 0.85rem;
      opacity: 0.85;
    }
    .dialog-body {
      padding: 16px 24px;
      min-width: 650px;
      max-height: 75vh;
    }
    .tab-pane {
      padding: 16px 4px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .section-card {
      background: #f8fafc;
      padding: 12px 16px;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    .section-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: #1e3a8a;
      margin: 0 0 6px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .section-text {
      margin: 0;
      color: #334155;
      font-size: 0.9rem;
    }
    .form-box {
      background: #f1f5f9;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
    }
    .form-box h4 {
      margin: 0 0 12px 0;
      color: #1e293b;
      font-size: 0.95rem;
    }
    .grid-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .flex-row {
      display: flex;
      gap: 12px;
    }
    .w-full {
      width: 100%;
    }
    .half {
      flex: 1;
    }
    .list-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .item-card {
      padding: 12px 16px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .item-title {
      font-weight: 600;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge-cie {
      background: #e0f2fe;
      color: #0369a1;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
    }
    .item-meta {
      font-size: 0.8rem;
      color: #64748b;
      margin-top: 4px;
    }
    .item-desc {
      font-size: 0.85rem;
      color: #475569;
      margin-top: 4px;
    }
    .empty-msg {
      text-align: center;
      color: #94a3b8;
      padding: 20px;
      font-style: italic;
    }
  `]
})
export class ConsultaDetailDialogComponent implements OnInit {
  private consultaService = inject(ConsultaService);
  private catService = inject(CatalogosService);
  private notify = inject(NotificationService);
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<ConsultaDetailDialogComponent>);

  diagnosticos: Diagnostico[] = [];
  tratamientos: Tratamiento[] = [];
  recetas: Receta[] = [];
  examenes: Examen[] = [];
  medicamentos: Medicamento[] = [];
  tiposExamen: TipoExamen[] = [];

  formDiag!: FormGroup;
  formTrat!: FormGroup;
  formReceta!: FormGroup;
  formExamen!: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ConsultaDetailDialogData) {}

  ngOnInit(): void {
    this.initForms();
    this.cargarDatos();
  }

  initForms(): void {
    this.formDiag = this.fb.group({
      descripcion: ['', [Validators.required]],
      codigoCie10: [''],
      tipo: ['PRESUNTIVO', [Validators.required]]
    });

    const today = new Date().toISOString().substring(0, 10);
    this.formTrat = this.fb.group({
      descripcion: ['', [Validators.required]],
      indicaciones: ['', [Validators.required]],
      fechaInicio: [today, [Validators.required]],
      estado: ['ACTIVO', [Validators.required]]
    });

    this.formReceta = this.fb.group({
      medicamentoId: [null, [Validators.required]],
      dosis: ['', [Validators.required]],
      frecuencia: ['', [Validators.required]],
      duracion: ['', [Validators.required]],
      viaAdministracion: ['Oral', [Validators.required]]
    });

    this.formExamen = this.fb.group({
      tipoExamenId: [null, [Validators.required]],
      prioridad: ['MEDIA', [Validators.required]],
      indicaciones: ['']
    });
  }

  cargarDatos(): void {
    const cId = this.data.consulta.id!;
    this.consultaService.listarDiagnosticos(cId).subscribe({
      next: (d) => (this.diagnosticos = d),
      error: (e) => console.error(e)
    });
    this.consultaService.listarTratamientos(cId).subscribe({
      next: (t) => (this.tratamientos = t),
      error: (e) => console.error(e)
    });
    this.consultaService.listarRecetas(cId).subscribe({
      next: (r) => (this.recetas = r),
      error: (e) => console.error(e)
    });
    this.consultaService.listarExamenes(cId).subscribe({
      next: (ex) => (this.examenes = ex),
      error: (e) => console.error(e)
    });
    this.catService.listarMedicamentos(false).subscribe({
      next: (m) => (this.medicamentos = m),
      error: (e) => console.error(e)
    });
    this.catService.listarTiposExamen(false).subscribe({
      next: (te) => (this.tiposExamen = te),
      error: (e) => console.error(e)
    });
  }

  agregarDiagnostico(): void {
    if (this.formDiag.invalid) return;
    const req: DiagnosticoRequest = this.formDiag.value;
    this.consultaService.crearDiagnostico(this.data.consulta.id!, req).subscribe({
      next: () => {
        this.notify.success('Diagnóstico registrado');
        this.formDiag.reset({ tipo: 'PRESUNTIVO' });
        this.cargarDatos();
      },
      error: (err) => this.notify.error('Error al registrar', err.error?.message || err.message)
    });
  }

  agregarTratamiento(): void {
    if (this.formTrat.invalid) return;
    const req: TratamientoRequest = this.formTrat.value;
    this.consultaService.crearTratamiento(this.data.consulta.id!, req).subscribe({
      next: () => {
        this.notify.success('Tratamiento registrado');
        this.formTrat.reset({ fechaInicio: new Date().toISOString().substring(0, 10), estado: 'ACTIVO' });
        this.cargarDatos();
      },
      error: (err) => this.notify.error('Error al registrar', err.error?.message || err.message)
    });
  }

  agregarReceta(): void {
    if (this.formReceta.invalid) return;
    const val = this.formReceta.value;
    const det: DetalleRecetaRequest = {
      medicamentoId: val.medicamentoId,
      dosis: val.dosis,
      frecuencia: val.frecuencia,
      duracion: val.duracion,
      viaAdministracion: val.viaAdministracion
    };
    const req: RecetaRequest = {
      detalles: [det]
    };
    this.consultaService.crearReceta(this.data.consulta.id!, req).subscribe({
      next: () => {
        this.notify.success('Receta emitida');
        this.formReceta.reset({ viaAdministracion: 'Oral' });
        this.cargarDatos();
      },
      error: (err) => this.notify.error('Error al emitir receta', err.error?.message || err.message)
    });
  }

  solicitarExamen(): void {
    if (this.formExamen.invalid) return;
    const req: ExamenRequest = this.formExamen.value;
    this.consultaService.solicitarExamen(this.data.consulta.id!, req).subscribe({
      next: () => {
        this.notify.success('Orden de examen solicitada');
        this.formExamen.reset({ prioridad: 'MEDIA' });
        this.cargarDatos();
      },
      error: (err) => this.notify.error('Error al solicitar examen', err.error?.message || err.message)
    });
  }
}
