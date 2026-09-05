import { Component } from '@angular/core';
import { RouterLink }     from '@angular/router';
import { MatCardModule }  from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule }  from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="unauth-container">
      <mat-card class="unauth-card">
        <mat-card-content class="unauth-content">
          <mat-icon class="unauth-icon">lock</mat-icon>
          <h1>Acceso denegado</h1>
          <p>No posee permisos para acceder a esta opción.</p>
          <button mat-raised-button color="primary" routerLink="/home" id="btn-back-home">
            <mat-icon>home</mat-icon>
            Regresar al inicio
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .unauth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f6fa;
      padding: 24px;
    }
    .unauth-card {
      max-width: 400px;
      width: 100%;
      border-radius: 16px !important;
    }
    .unauth-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 40px 32px !important;
      text-align: center;
    }
    .unauth-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: #F44336;
    }
    h1 { margin: 0; color: #1a237e; font-size: 1.5rem; }
    p  { margin: 0; color: #6b7280; }
    button { display: flex; align-items: center; gap: 8px; }
  `]
})
export class UnauthorizedComponent {}
