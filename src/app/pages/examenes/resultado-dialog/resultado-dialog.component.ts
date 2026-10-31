import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Examen, ResultadoExamen, ResultadoExamenRequest } from '../../../models/examen/examen.model';

export interface ResultadoDialogData {
  examen: Examen;
  resultado?: ResultadoExamen | null;
  readonly: boolean;
}

@Component({
  selector: 'app-resultado-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon>biotech</mat-icon>
      {{ data.readonly ? 'Resultado de Laboratorio' : 'Registrar Resultado de Examen' }}
    </h2>

    <mat-dialog-content class="dialog-content">
      <div class="exam-info">
        <strong>Examen:</strong> {{ data.examen.tipoExamen }} |
        <strong>Prioridad:</strong> {{ data.examen.prioridad }} |
        <strong>Solicitado:</strong> {{ data.examen.fechaSolicitud | date:'dd/MM/yyyy HH:mm' }}
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Fecha y Hora de Emisión del Resultado</mat-label>
          <input matInput type="datetime-local" formControlName="fechaResultado">
          <mat-error *ngIf="form.get('fechaResultado')?.hasError('required')">Fecha y hora requerida</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Valores y Resultados</mat-label>
          <textarea
            matInput
            formControlName="resultado"
            rows="4"
            placeholder="Valores obtenidos, parámetros cuantitativos o cualitativos..."
          ></textarea>
          <mat-error *ngIf="form.get('resultado')?.hasError('required')">El resultado es obligatorio</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Conclusión / Interpretación Clínica</mat-label>
          <textarea
            matInput
            formControlName="conclusion"
            rows="2"
            placeholder="Conclusión diagnóstica de laboratorio..."
          ></textarea>
          <mat-error *ngIf="form.get('conclusion')?.hasError('required')">La conclusión es obligatoria</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>URL / Enlace de Archivo Adjunto (Opcional)</mat-label>
          <input matInput formControlName="archivoUrl" placeholder="https://almacenamiento.clinica.com/examenes/doc123.pdf">
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Observaciones de Laboratorio</mat-label>
          <input matInput formControlName="observaciones" placeholder="Condiciones de la muestra, reactivos, etc.">
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="dialogRef.close()">Cerrar</button>
      <button
        *ngIf="!data.readonly"
        mat-raised-button
        color="primary"
        [disabled]="form.invalid"
        (click)="onSubmit()"
      >
        <mat-icon>check_circle</mat-icon> Guardar Resultado
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e3a8a;
      margin: 0;
      padding: 16px 24px;
    }
    .dialog-content {
      padding: 16px 24px;
      min-width: 520px;
    }
    .exam-info {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 0.85rem;
      margin-bottom: 16px;
    }
    .w-full {
      width: 100%;
      margin-bottom: 12px;
    }
    .dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e2e8f0;
    }
  `]
})
export class ResultadoDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<ResultadoDialogComponent>);

  form!: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ResultadoDialogData) {}

  ngOnInit(): void {
    const res = this.data.resultado;
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const defaultDate = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    this.form = this.fb.group({
      fechaResultado: [{ value: res?.fechaResultado?.substring(0, 16) || defaultDate, disabled: this.data.readonly }, [Validators.required]],
      resultado: [{ value: res?.resultado || '', disabled: this.data.readonly }, [Validators.required]],
      conclusion: [{ value: res?.conclusion || '', disabled: this.data.readonly }, [Validators.required]],
      archivoUrl: [{ value: res?.archivoUrl || '', disabled: this.data.readonly }],
      observaciones: [{ value: res?.observaciones || '', disabled: this.data.readonly }]
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.data.readonly) return;
    const val = this.form.getRawValue();
    const req: ResultadoExamenRequest = {
      fechaResultado: val.fechaResultado.length === 16 ? `${val.fechaResultado}:00` : val.fechaResultado,
      resultado: val.resultado.trim(),
      conclusion: val.conclusion.trim(),
      archivoUrl: val.archivoUrl ? val.archivoUrl.trim() : undefined,
      observaciones: val.observaciones ? val.observaciones.trim() : undefined
    };
    this.dialogRef.close(req);
  }
}
