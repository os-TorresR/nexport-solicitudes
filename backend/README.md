# Backend · NEXPORT Solicitud de Servicios

API en **ASP.NET Core (.NET 10)** con **SQL Server** (Entity Framework Core), login con **JWT y roles**,
registro de usuarios y **correos** al admin y al cliente.

## Primer arranque

1. Requisitos: .NET 10 SDK y SQL Server (Developer o Express) corriendo.
2. Revisa la cadena de conexión en `Nexport.Solicitudes.Api/appsettings.json`:
   ```
   Server=localhost;Database=NexportSolicitudes;Trusted_Connection=True;TrustServerCertificate=True
   ```
   Si instalaste SQL Server Express, cambia `Server=localhost` por `Server=localhost\SQLEXPRESS`.
3. Ejecuta:
   ```powershell
   cd backend\Nexport.Solicitudes.Api
   dotnet run
   ```
   Al arrancar, la API **crea la base `NexportSolicitudes` y sus tablas** si no existen, crea el
   **administrador inicial** y la plantilla estándar.
4. Abre `http://localhost:5080/swagger` para ver los endpoints.

Administrador inicial (solo en desarrollo, `appsettings.Development.json`):
`admin@nexport.local` / `Admin123!` → cámbialo antes de usarlo con datos reales.

## Correos

Por defecto `Correo:Habilitado = false` (**modo simulado**): cada correo se guarda como archivo `.eml`
en la carpeta `correos-simulados/` (se abre con Outlook) y queda registrado en la tabla `Comunicaciones`.

Para enviar de verdad, completa la sección `Correo` (por ejemplo Office 365):

```json
"Correo": {
  "Habilitado": true,
  "Host": "smtp.office365.com",
  "Puerto": 587,
  "UsarStartTls": true,
  "Usuario": "notificaciones@tuempresa.cl",
  "Password": "...",
  "Remitente": "notificaciones@tuempresa.cl",
  "AdminDestinatarios": [ "jefe.operaciones@tuempresa.cl" ]
}
```

No guardes contraseñas en Git: usa `dotnet user-secrets` o variables de entorno (`Correo__Password`).

Correos que envía el sistema:

| Cuándo | A quién |
|---|---|
| Se crea una solicitud | Admin (`AdminDestinatarios` + usuarios con rol Admin) |
| Se crea una solicitud | El solicitante (acuse de recibo con el folio) |
| Se registra un usuario nuevo | Admin |
| El admin activa una cuenta | El usuario |
| Operación aprueba | El cliente (plantilla configurable) |
| Operación pide más información | El cliente |
| El cliente corrige la solicitud | Admin |

Si un envío falla, la operación igual se guarda y la comunicación queda en estado `Error`, con un
botón para reintentar desde el panel.

## Roles

| Rol | Puede |
|---|---|
| `Cliente` | Crear solicitudes y ver solo las suyas |
| `Operacion` | Ver todas, aprobar las normales, pedir información, avanzar estados |
| `JefeTurno` | Lo anterior + aprobar **extraordinarias** (después de las 15:00) + editar plantillas |
| `Admin` | Todo + administrar usuarios |

Los usuarios se registran como `Cliente`. El Admin asigna los demás roles desde la página Usuarios.
Cómo se activan las cuentas nuevas (sección `Registro` de `appsettings.json`):

| Configuración | Resultado |
|---|---|
| `"RequiereAprobacion": false` | Todas las cuentas quedan activas al registrarse |
| `"RequiereAprobacion": true` y `"DominiosAutoAprobados": []` | Todas quedan Pendientes hasta que un Admin las active |
| `"RequiereAprobacion": true` y `"DominiosAutoAprobados": ["bridgestone.cl", "ultraport.cl"]` | Se activan solas las de esos dominios; el resto queda Pendiente |

En todos los casos el admin recibe un correo con cada registro nuevo.

Cada usuario puede cambiar su contraseña en **Mi cuenta** (`POST /api/auth/cambiar-password`).
La contraseña del administrador inicial se cambia ahí mismo: `AdminInicial` solo se usa para crear
el primer admin cuando la base está vacía.

## Secretos

No dejes claves reales en `appsettings.json` (queda en Git). En desarrollo usa `dotnet user-secrets`:

```powershell
dotnet user-secrets init
dotnet user-secrets set "Jwt:Clave" "una-clave-larga-de-al-menos-32-caracteres"
dotnet user-secrets set "Correo:Password" "..."
```

En un servidor Linux usa variables de entorno (`Jwt__Clave`, `Correo__Password`,
`ConnectionStrings__Nexport`, `AdminInicial__Password`) o AWS Parameter Store / Secrets Manager.

## Endpoints

| Método | Ruta | Rol |
|---|---|---|
| POST | `/api/auth/registro` | público |
| POST | `/api/auth/login` | público |
| GET | `/api/auth/me` | cualquiera con sesión |
| POST | `/api/auth/cambiar-password` | cualquiera con sesión |
| GET | `/api/solicitudes?estado=&q=` | cliente (las suyas) / personal (todas) |
| GET | `/api/solicitudes/{folio}` | ídem |
| POST | `/api/solicitudes` | cualquiera con sesión |
| PUT | `/api/solicitudes/{folio}` | quien la creó, solo en "Info solicitada" (corrige y vuelve a revisión) |
| POST | `/api/solicitudes/{folio}/aprobar` | Operacion, JefeTurno, Admin |
| POST | `/api/solicitudes/{folio}/solicitar-info` | Operacion, JefeTurno, Admin |
| POST | `/api/solicitudes/{folio}/avanzar` | Operacion, JefeTurno, Admin |
| POST | `/api/solicitudes/{folio}/comunicaciones/{id}/reenviar` | Operacion, JefeTurno, Admin |
| GET | `/api/plantillas` | Operacion, JefeTurno, Admin |
| PUT / DELETE | `/api/plantillas/{general\|servicio}` | JefeTurno, Admin |
| GET | `/api/usuarios` | Admin |
| PATCH | `/api/usuarios/{id}` | Admin |

## Tablas (SQL Server)

`Usuarios`, `Solicitudes`, `SolicitudItems`, `Aprobaciones`, `Comunicaciones`,
`HistorialSolicitudes`, `Plantillas`. Se definen en `Data/NexportDbContext.cs`.

## Estructura (comparada con Spring Boot)

```
Nexport.Solicitudes.Api/
  Program.cs              configuración (como @Configuration + application.properties)
  appsettings.json        configuración (como application.properties)
  Common/                 roles, errores, hora de Chile, catálogo
  Data/
    NexportDbContext.cs   tablas y relaciones (como JPA + repositorios)
    Entities/             clases de las tablas (como @Entity)
    DbInicializador.cs    crea la base, el admin y la plantilla
  Features/
    Auth/                 registro, login, JWT
    Solicitudes/          controller (@RestController), service (@Service) y DTOs
    Plantillas/
    Usuarios/
    Correo/               envío SMTP (MailKit) y avisos
```

## Hacia producción

- Cambia `Jwt:Clave` (variable de entorno `Jwt__Clave`, 32+ caracteres).
- Pasa a migraciones de EF: `dotnet ef migrations add Inicial`, desactiva `BaseDatos:CrearAutomaticamente`.
- Agrega la URL publicada del front en `Cors:Origenes` y `App:UrlFrontend`.
