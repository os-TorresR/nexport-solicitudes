# NEXPORT · Solicitud de Servicios (fase inicial)

Módulo independiente en React (Vite) que reemplaza el MVP `SOLICITUD_DE_SERVICIOS.html` y cubre el
alcance de la presentación **"Fase inicial"**: ingreso → revisión → aprobación → confirmación al
cliente → programación.

## Ejecutar

Primero levanta el backend (`../backend`, ver su README). Luego:

```bash
cp .env.example .env.local   # VITE_API_URL=http://localhost:5080/api
npm install
npm run dev                  # http://localhost:5173
npm run build                # genera dist/
```

Ingreso inicial (desarrollo): `admin@nexport.local` / `Admin123!`.

## Rutas

| Ruta | Quién | Qué hace |
|---|---|---|
| `/ingresar` | Todos | Inicio de sesión |
| `/registro` | Público | Registro de usuario (queda pendiente hasta que un Admin lo active) |
| `/` | Cliente | Catálogo CFS IMPO e indicadores |
| `/solicitar/:servicio` | Cliente | Formulario (información general, carga, observaciones) |
| `/solicitud-enviada/:folio` | Cliente | Folio generado |
| `/solicitudes` | Cliente | Mis solicitudes (búsqueda y filtro por estado) |
| `/solicitudes/:folio` | Cliente | Seguimiento: avance, aprobación e historial |
| `/operacion` | Operación | Bandeja: por revisar, pendientes VB, extraordinarias |
| `/operacion/solicitudes/:folio` | Operación | Revisión, Aprobar / Solicitar info, confirmación al cliente, avance de estado |
| `/operacion/plantillas` | Operación | Plantilla de confirmación general y por servicio (editan Jefe de Turno y Admin) |
| `/operacion/usuarios` | Admin | Activar usuarios y asignar roles |

## Reglas implementadas

- **Folio** `SOL-CFS-AAAAMMDD-NNNN`.
- **Horario de corte 15:00**: después de esa hora la solicitud queda *Pendiente VB* (extraordinaria) y la aprobación corresponde al Jefe de Turno.
- **Estados**: Ingresada → (Pendiente VB / Info solicitada) → Aprobada → Programada → En ejecución → Finalizada.
- **Aprobación**: responsable, fecha/hora, turno confirmado, sector/ventana y observación.
- **Confirmación al cliente**: se genera al aprobar con la plantilla del servicio (o la general) y queda registrada con destinatario, asunto y mensaje.
- **Historial** de cada acción (trazabilidad).

## Estructura

```
src/
  pages/        auth/, cliente/ y operacion/ (una carpeta por área)
  components/   common/ (reutilizables), solicitud/, operacion/
  layouts/      ClienteLayout (barra inferior) y OperacionLayout (panel)
  services/     api (fetch + token), authService, solicitudesService, plantillasService, usuariosService
  context/      AuthProvider (usuario de la sesión)
  hooks/        useAuth, useSolicitudes, useSolicitud
  data/         catálogo de servicios, estados, turnos, plantilla estándar
  utils/        formato de fechas, validación, plantilla, horario
  routes/       rutas y RequireAuth (protección por rol)
  styles/       global.css (paleta y estilos del MVP original)
```

## Datos

Todo se guarda en SQL Server a través de la API (`src/services/`). El token de sesión se guarda en
el navegador (`localStorage`) y se envía en cada llamada. Si la API responde 401, la app vuelve a
`/ingresar`.

| Servicio | Endpoints |
|---|---|
| `authService` | `/api/auth/registro`, `/api/auth/login`, `/api/auth/me` |
| `solicitudesService` | `/api/solicitudes` (+ aprobar, solicitar-info, avanzar, reenviar) |
| `plantillasService` | `/api/plantillas` |
| `usuariosService` | `/api/usuarios` |

## Publicar en Cloudflare

Incluye `wrangler.jsonc` (modo SPA). En Cloudflare: Root directory = carpeta de este proyecto,
Build command `npm run build`, Deploy command `npx wrangler deploy`, y la variable de compilación
`VITE_API_URL` con la URL pública de la API.
