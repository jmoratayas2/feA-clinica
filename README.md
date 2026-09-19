# Frontend Clínicas UMG (`feA-clinica`)

Aplicación web Single Page Application (SPA) desarrollada con **Angular 22** y **Angular Material** para el sistema de gestión de clínicas médicas.

---

## 🚀 Características Principales

- **Autenticación con JWT:** Integración con `security-clinic` (puerto 8081). Gestión de sesión reactiva mediante Signals, almacenamiento seguro en `sessionStorage` e interceptor HTTP automático (`auth.interceptor.ts`).
- **Menú Dinámico por Accesos (Serie II):** Menú lateral de navegación construido 100% dinámicamente desde el backend (`GET /api/security/usuarios/me/menu`) a través de `MenuService`.
  - Soporte de **jerarquía padre/hijo** con acordeón expandible para submódulos.
  - Uso de íconos dinámicos de **Material Design**.
  - Control de apertura y cierre mediante botón tipo **hamburguesa**.
  - Sin módulos estáticos o hardcodeados para simular permisos.
- **Gestión de Pacientes con Paginación Real:** Consumo de `/api/v1/pacientes` en `clinicaBK` con filtros dinámicos y paginación en base de datos.
- **Protección de Rutas:** Guardias de navegación funcionales (`authGuard`, `permissionGuard`).
- **Notificaciones Modernas:** Alertas interactivas mediante SweetAlert2.

---

## 📋 Requisitos

- Node.js 20 o superior.
- npm 10+.
- Angular CLI 22 (`npm install -g @angular/cli`).

---

## ⚙️ Configuración de Entornos (`src/environments/environment.ts`)

```typescript
export const environment = {
  production: false,
  securityApiUrl: 'http://localhost:8081', // Microservicio de Seguridad
  clinicApiUrl:   'http://localhost:8080'  // Microservicio de Negocio Clínico
};
```

---

## 💻 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en http://localhost:4200/
npm start
# o
ng serve

# Compilar para producción (carpeta dist/)
npm run build
```

---

## 📁 Estructura del Proyecto

```
src/app/
├── core/
│   ├── guards/          # authGuard, permissionGuard
│   ├── interceptors/    # auth.interceptor (agrega Authorization: Bearer <JWT>)
│   └── services/        # auth.service, menu.service, token.service, notification.service
├── layout/
│   ├── main-layout/     # Sidenav container con toggle responsivo
│   ├── navbar/          # Barra superior con botón hamburguesa y logout
│   └── sidebar/         # Menú lateral dinámico con soporte de submódulos
├── models/
│   ├── auth/            # Modelos de login y credenciales
│   ├── menu/            # MenuModulo (jerarquía padre/hijo)
│   └── paciente/        # Paciente, filtros y paginación
└── pages/
    ├── auth/            # Vista de Login
    ├── home/            # Dashboard inicial
    ├── pacientes/       # Lista paginada, formulario y detalle
    └── unauthorized/    # Error 403
```
