using System.Globalization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Nexport.Solicitudes.Api.Common;
using Nexport.Solicitudes.Api.Data;
using Nexport.Solicitudes.Api.Data.Entities;
using Nexport.Solicitudes.Api.Features.Correo;
using Nexport.Solicitudes.Api.Features.Plantillas;

namespace Nexport.Solicitudes.Api.Features.Solicitudes;

/// <summary>Reglas de negocio de las solicitudes (equivale a un @Service de Spring).</summary>
public class SolicitudesService(
    NexportDbContext db,
    PlantillasService plantillas,
    NotificacionesService notificaciones,
    Reloj reloj)
{
    // Lo que ve el cliente de las comunicaciones (no ve los avisos internos al admin).
    private static readonly string[] ComunicacionesCliente = [TiposComunicacion.AcuseCliente, TiposComunicacion.ConfirmacionCliente, TiposComunicacion.InfoSolicitada];

    // ------------------------------------------------------------------ Consultas

    public async Task<List<SolicitudDto>> ListarAsync(ClaimsPrincipal user, string? estado, string? q)
    {
        var query = db.Solicitudes.AsNoTracking()
            .Include(s => s.Items)
            .Include(s => s.Aprobaciones)
            .AsSplitQuery()
            .AsQueryable();

        if (!Roles.EsPersonal(user.Rol()))
        {
            var id = user.UsuarioId();
            query = query.Where(s => s.UsuarioId == id);
        }
        if (!string.IsNullOrWhiteSpace(estado)) query = query.Where(s => s.Estado == estado);
        if (!string.IsNullOrWhiteSpace(q))
        {
            var texto = q.Trim();
            query = query.Where(s => s.Folio.Contains(texto) || s.Cliente.Contains(texto) || s.Servicio.Contains(texto) || s.Solicitante.Contains(texto));
        }

        var lista = await query.OrderByDescending(s => s.FechaSolicitud).ToListAsync();
        return lista.Select(s => SolicitudDto.Desde(s, incluirDetalle: false)).ToList();
    }

    public async Task<SolicitudDto> ObtenerAsync(string folio, ClaimsPrincipal user)
    {
        var s = await CargarAsync(folio, user, tracking: false);
        return ADto(s, user);
    }

    // ------------------------------------------------------------------ Crear

    public async Task<SolicitudDto> CrearAsync(CrearSolicitudRequest req, ClaimsPrincipal user)
    {
        var (fechaRequerida, items) = Validar(req);
        var ahora = reloj.Ahora();
        var extraordinaria = reloj.EsExtraordinaria(ahora);
        var solicitante = Texto.Requerido(req.Solicitante);

        var s = new Solicitud
        {
            FechaSolicitud = ahora,
            ServicioId = req.ServicioId!,
            Servicio = Catalogo.Servicios[req.ServicioId!],
            Estado = extraordinaria ? EstadosSolicitud.PendienteVb : EstadosSolicitud.Ingresada,
            Extraordinaria = extraordinaria,
            UsuarioId = user.UsuarioId(),
            Cliente = Texto.Requerido(req.Cliente),
            Solicitante = solicitante,
            CorreoSolicitante = Texto.Requerido(req.CorreoSolicitante).ToLowerInvariant(),
            Agencia = Texto.Limpio(req.Agencia),
            DenominacionOT = Texto.Limpio(req.DenominacionOT),
            Nave = Texto.Limpio(req.Nave),
            Viaje = Texto.Limpio(req.Viaje),
            LineaNaviera = Texto.Limpio(req.LineaNaviera),
            DiasDemurrage = req.DiasDemurrage ?? 0,
            FechaRequerida = fechaRequerida,
            Turno = req.Turno!,
            Observaciones = Texto.Limpio(req.Observaciones),
            Items = items,
        };
        s.Historial.Add(new HistorialEvento
        {
            FechaHora = ahora,
            Accion = "Solicitud ingresada",
            Detalle = extraordinaria ? $"Fuera de horario: requiere VB del Jefe de Turno" : "Dentro del horario normal",
            Usuario = user.Nombre(),
        });
        db.Solicitudes.Add(s);
        await GuardarConFolioAsync(s);

        // Los correos (aviso al admin y acuse al solicitante) se envían después de guardar:
        // si alguno falla, la solicitud igual queda registrada.
        await notificaciones.AvisarNuevaSolicitudAsync(s);
        await notificaciones.AcusarReciboAsync(s);
        return await ObtenerAsync(s.Folio, user);
    }

    /// <summary>Folio SOL-CFS-AAAAMMDD-NNNN con correlativo diario. Reintenta si otro usuario tomó el mismo número.</summary>
    private async Task GuardarConFolioAsync(Solicitud s)
    {
        var prefijo = $"SOL-CFS-{s.FechaSolicitud:yyyyMMdd}-";
        for (var intento = 0; ; intento++)
        {
            var ultimo = await db.Solicitudes.AsNoTracking()
                .Where(x => x.Folio.StartsWith(prefijo))
                .OrderByDescending(x => x.Folio)
                .Select(x => x.Folio)
                .FirstOrDefaultAsync();
            var correlativo = ultimo is null ? 1 : int.Parse(ultimo[prefijo.Length..], CultureInfo.InvariantCulture) + 1;
            s.Folio = $"{prefijo}{correlativo:D4}";
            try
            {
                await db.SaveChangesAsync();
                return;
            }
            catch (DbUpdateException) when (intento < 4)
            {
                // Si el folio quedó ocupado por una solicitud simultánea, se intenta con el siguiente;
                // cualquier otro error se propaga.
                var ocupado = await db.Solicitudes.AsNoTracking().AnyAsync(x => x.Folio == s.Folio);
                if (!ocupado) throw;
            }
        }
    }

    private (DateOnly FechaRequerida, List<SolicitudItem> Items) Validar(CrearSolicitudRequest req)
        => ValidarConExtras(req, new Dictionary<string, string>());

    /// <summary>Valida la solicitud; <paramref name="campos"/> puede traer errores previos de otros campos.</summary>
    private (DateOnly FechaRequerida, List<SolicitudItem> Items) ValidarConExtras(CrearSolicitudRequest req, Dictionary<string, string> campos)
    {
        if (string.IsNullOrWhiteSpace(req.ServicioId) || !Catalogo.Servicios.ContainsKey(req.ServicioId))
            campos["servicioId"] = "Servicio no válido.";
        if (string.IsNullOrWhiteSpace(req.Cliente)) campos["cliente"] = "Ingresa el cliente.";
        if (string.IsNullOrWhiteSpace(req.Solicitante)) campos["solicitante"] = "Ingresa el nombre del solicitante.";
        if (!Texto.EsCorreo(req.CorreoSolicitante)) campos["correoSolicitante"] = "Ingresa un correo válido para la confirmación.";
        if (req.DiasDemurrage < 0) campos["diasDemurrage"] = "No puede ser negativo.";
        if (string.IsNullOrWhiteSpace(req.Turno) || !Catalogo.Turnos.Contains(req.Turno)) campos["turno"] = "Selecciona el turno.";
        Texto.Largo(campos, "cliente", req.Cliente, 150);
        Texto.Largo(campos, "solicitante", req.Solicitante, 150);
        Texto.Largo(campos, "correoSolicitante", req.CorreoSolicitante, 150);
        Texto.Largo(campos, "agencia", req.Agencia, 150);
        Texto.Largo(campos, "denominacionOT", req.DenominacionOT, 200);
        Texto.Largo(campos, "nave", req.Nave, 100);
        Texto.Largo(campos, "viaje", req.Viaje, 50);
        Texto.Largo(campos, "lineaNaviera", req.LineaNaviera, 100);
        Texto.Largo(campos, "observaciones", req.Observaciones, 2000);

        var fecha = default(DateOnly);
        if (!DateOnly.TryParseExact(req.FechaRequerida, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out fecha))
            campos["fechaRequerida"] = "Selecciona la fecha requerida.";
        else if (fecha < reloj.Hoy())
            campos["fechaRequerida"] = "La fecha requerida no puede ser anterior a hoy.";

        var items = new List<SolicitudItem>();
        if (req.Items is null || req.Items.Count == 0)
        {
            campos["items"] = "Agrega al menos un ítem de carga.";
        }
        else
        {
            for (var i = 0; i < req.Items.Count; i++)
            {
                var it = req.Items[i];
                var valido = !string.IsNullOrWhiteSpace(it.Bl) && !string.IsNullOrWhiteSpace(it.Tipo)
                    && it.Cantidad is >= 0m and < 10_000_000_000m && (it.Peso ?? 0m) is >= 0m and < 1_000_000_000_000m
                    && it.Um is not null && Catalogo.UnidadesMedida.Contains(it.Um)
                    && it.Bl.Trim().Length <= 60 && it.Tipo.Trim().Length <= 100
                    && (it.Id?.Trim().Length ?? 0) <= 30 && (it.Dim?.Trim().Length ?? 0) <= 60;
                if (!valido)
                {
                    campos["items"] = $"El ítem {i + 1} está incompleto o tiene valores fuera de rango: BL/GD, tipo, cantidad y unidad de medida son obligatorios.";
                    break;
                }
                items.Add(new SolicitudItem
                {
                    Orden = i + 1,
                    Bl = it.Bl!.Trim(),
                    Tipo = it.Tipo!.Trim(),
                    IdContenedor = Texto.Limpio(it.Id),
                    Dimensiones = Texto.Limpio(it.Dim),
                    Cantidad = it.Cantidad!.Value,
                    Peso = it.Peso ?? 0,
                    UnidadMedida = it.Um!,
                });
            }
        }

        if (campos.Count > 0) throw ApiException.Validacion(campos);
        return (fecha, items);
    }

    /// <summary>
    /// El cliente corrige su solicitud cuando Operación pidió más información.
    /// Solo el dueño y solo en estado "Info solicitada"; luego vuelve a revisión.
    /// </summary>
    public async Task<SolicitudDto> ActualizarPorClienteAsync(string folio, ActualizarSolicitudRequest req, ClaimsPrincipal user)
    {
        var s = await CargarAsync(folio, user, tracking: true);
        if (s.UsuarioId != user.UsuarioId())
            throw ApiException.Prohibido("Solo quien creó la solicitud puede corregirla.");
        if (s.Estado != EstadosSolicitud.InfoSolicitada)
            throw ApiException.Conflicto($"La solicitud está \"{s.Estado}\": solo se puede corregir cuando Operación pide más información.");

        var comentario = Texto.Requerido(req.Comentario);
        var camposComentario = new Dictionary<string, string>();
        if (comentario.Length == 0) camposComentario["comentario"] = "Cuéntale a Operación qué información agregaste.";
        Texto.Largo(camposComentario, "comentario", comentario, 1000);

        // Mismas validaciones que al crear (el servicio no cambia).
        var (fechaRequerida, items) = ValidarConExtras(new CrearSolicitudRequest(
            s.ServicioId, req.Cliente, req.Solicitante, req.CorreoSolicitante, req.Agencia, req.DenominacionOT,
            req.Nave, req.Viaje, req.LineaNaviera, req.DiasDemurrage, req.FechaRequerida, req.Turno, req.Observaciones, req.Items),
            camposComentario);

        var ahora = reloj.Ahora();
        s.Cliente = Texto.Requerido(req.Cliente);
        s.Solicitante = Texto.Requerido(req.Solicitante);
        s.CorreoSolicitante = Texto.Requerido(req.CorreoSolicitante).ToLowerInvariant();
        s.Agencia = Texto.Limpio(req.Agencia);
        s.DenominacionOT = Texto.Limpio(req.DenominacionOT);
        s.Nave = Texto.Limpio(req.Nave);
        s.Viaje = Texto.Limpio(req.Viaje);
        s.LineaNaviera = Texto.Limpio(req.LineaNaviera);
        s.DiasDemurrage = req.DiasDemurrage ?? 0;
        s.FechaRequerida = fechaRequerida;
        s.Turno = req.Turno!;
        s.Observaciones = Texto.Limpio(req.Observaciones);
        s.Items.Clear(); // EF borra los ítems anteriores (relación obligatoria)
        s.Items.AddRange(items);
        // Vuelve a la bandeja; si era extraordinaria, sigue necesitando el VB del Jefe de Turno.
        s.Estado = s.Extraordinaria ? EstadosSolicitud.PendienteVb : EstadosSolicitud.Ingresada;
        s.ActualizadoEn = ahora;
        s.Historial.Add(new HistorialEvento { FechaHora = ahora, Accion = "Información agregada por el cliente", Detalle = comentario, Usuario = user.Nombre() });
        await db.SaveChangesAsync();

        await notificaciones.AvisarSolicitudCorregidaAsync(s, comentario);
        return ADto(s, user);
    }

    // ------------------------------------------------------------------ Revisión

    public async Task<SolicitudDto> AprobarAsync(string folio, AprobarRequest req, ClaimsPrincipal user)
    {
        var s = await CargarAsync(folio, user, tracking: true);
        ExigirEnRevision(s);
        if (s.Extraordinaria && !Roles.PuedeDarVb(user.Rol()))
            throw ApiException.Prohibido("Solo el Jefe de Turno o un administrador puede aprobar solicitudes extraordinarias.");

        var campos = new Dictionary<string, string>();
        if (string.IsNullOrWhiteSpace(req.TurnoConfirmado) || !Catalogo.Turnos.Contains(req.TurnoConfirmado)) campos["turnoConfirmado"] = "Confirma el turno.";
        if (string.IsNullOrWhiteSpace(req.Sector)) campos["sector"] = "Indica el sector o ventana.";
        Texto.Largo(campos, "sector", req.Sector, 100);
        Texto.Largo(campos, "observacion", req.Observacion, 1000);
        if (campos.Count > 0) throw ApiException.Validacion(campos, "Completa los datos de la aprobación.");

        var ahora = reloj.Ahora();
        var aprobacion = new Aprobacion
        {
            Resultado = ResultadosAprobacion.Aprobada,
            UsuarioId = user.UsuarioId(),
            Responsable = user.Nombre(),
            TurnoConfirmado = req.TurnoConfirmado,
            Sector = req.Sector!.Trim(),
            Observacion = Texto.Limpio(req.Observacion),
            FechaHora = ahora,
        };
        s.Aprobaciones.Add(aprobacion);
        s.Estado = EstadosSolicitud.Aprobada;
        s.ActualizadoEn = ahora;
        s.Historial.Add(new HistorialEvento
        {
            FechaHora = ahora,
            Accion = s.Extraordinaria ? "Aprobada con VB de Jefe de Turno" : "Aprobada",
            Detalle = $"{aprobacion.TurnoConfirmado} · {aprobacion.Sector}",
            Usuario = aprobacion.Responsable,
        });
        await db.SaveChangesAsync();

        // Confirmación al cliente con la plantilla del servicio (o la general).
        var plantilla = await plantillas.ParaServicioAsync(s.ServicioId);
        var variables = new Dictionary<string, string>
        {
            ["folio"] = s.Folio,
            ["servicio"] = s.Servicio,
            ["cliente"] = s.Cliente,
            ["solicitante"] = s.Solicitante,
            ["fecha_requerida"] = s.FechaRequerida.ToString("dd-MM-yyyy", CultureInfo.InvariantCulture),
            ["turno"] = aprobacion.TurnoConfirmado ?? s.Turno,
            ["sector"] = aprobacion.Sector ?? "",
            ["obs_aprobacion"] = aprobacion.Observacion ?? "Sin observaciones",
            ["responsable"] = aprobacion.Responsable,
        };
        var comunicacion = await notificaciones.EnviarConfirmacionAsync(
            s, Texto.Render(plantilla.Asunto, variables), Texto.Render(plantilla.Mensaje, variables), plantilla.Origen);

        s.Historial.Add(new HistorialEvento
        {
            FechaHora = reloj.Ahora(),
            Accion = comunicacion.EstadoEnvio == EstadosEnvio.Error ? "Error al enviar la confirmación al cliente" : "Confirmación enviada al cliente",
            Detalle = comunicacion.EstadoEnvio == EstadosEnvio.Error ? comunicacion.Error : comunicacion.Destinatario,
            Usuario = aprobacion.Responsable,
        });
        await db.SaveChangesAsync();
        return ADto(s, user);
    }

    public async Task<SolicitudDto> SolicitarInfoAsync(string folio, SolicitarInfoRequest req, ClaimsPrincipal user)
    {
        var s = await CargarAsync(folio, user, tracking: true);
        ExigirEnRevision(s);
        if (string.IsNullOrWhiteSpace(req.Observacion))
            throw ApiException.Validacion(new Dictionary<string, string> { ["observacion"] = "Explica qué información falta." }, "Completa los datos para solicitar información.");
        if (req.Observacion.Trim().Length > 1000)
            throw ApiException.Validacion(new Dictionary<string, string> { ["observacion"] = "Máximo 1000 caracteres." });

        var ahora = reloj.Ahora();
        var observacion = req.Observacion.Trim();
        s.Aprobaciones.Add(new Aprobacion
        {
            Resultado = ResultadosAprobacion.InfoSolicitada,
            UsuarioId = user.UsuarioId(),
            Responsable = user.Nombre(),
            Observacion = observacion,
            FechaHora = ahora,
        });
        s.Estado = EstadosSolicitud.InfoSolicitada;
        s.ActualizadoEn = ahora;
        s.Historial.Add(new HistorialEvento { FechaHora = ahora, Accion = "Información solicitada al cliente", Detalle = observacion, Usuario = user.Nombre() });
        await db.SaveChangesAsync();

        await notificaciones.AvisarInfoSolicitadaAsync(s, observacion, user.Nombre());
        return ADto(s, user);
    }

    public async Task<SolicitudDto> AvanzarAsync(string folio, ClaimsPrincipal user)
    {
        var s = await CargarAsync(folio, user, tracking: true);
        if (!EstadosSolicitud.Siguiente.TryGetValue(s.Estado, out var siguiente))
            throw ApiException.Conflicto($"La solicitud está \"{s.Estado}\" y no tiene un siguiente paso.");

        var ahora = reloj.Ahora();
        s.Estado = siguiente;
        s.ActualizadoEn = ahora;
        s.Historial.Add(new HistorialEvento { FechaHora = ahora, Accion = $"Estado: {siguiente}", Usuario = user.Nombre() });
        await db.SaveChangesAsync();
        return ADto(s, user);
    }

    public async Task<SolicitudDto> ReenviarComunicacionAsync(string folio, int comunicacionId, ClaimsPrincipal user)
    {
        var s = await CargarAsync(folio, user, tracking: true);
        var c = s.Comunicaciones.FirstOrDefault(x => x.Id == comunicacionId)
            ?? throw ApiException.NoEncontrado("La comunicación no existe.");
        if (c.EstadoEnvio is EstadosEnvio.Enviado or EstadosEnvio.Simulado)
            throw ApiException.Conflicto("Esta comunicación ya fue enviada.");

        await notificaciones.ReenviarAsync(c);
        s.Historial.Add(new HistorialEvento
        {
            FechaHora = reloj.Ahora(),
            Accion = c.EstadoEnvio == EstadosEnvio.Error ? "Reintento de envío fallido" : "Comunicación reenviada",
            Detalle = c.EstadoEnvio == EstadosEnvio.Error ? c.Error : c.Destinatario,
            Usuario = user.Nombre(),
        });
        await db.SaveChangesAsync();
        return ADto(s, user);
    }

    // ------------------------------------------------------------------ Auxiliares

    private async Task<Solicitud> CargarAsync(string folio, ClaimsPrincipal user, bool tracking)
    {
        IQueryable<Solicitud> query = db.Solicitudes
            .Include(s => s.Items)
            .Include(s => s.Aprobaciones)
            .Include(s => s.Comunicaciones)
            .Include(s => s.Historial)
            .AsSplitQuery();
        if (!tracking) query = query.AsNoTracking();

        var s = await query.FirstOrDefaultAsync(x => x.Folio == folio);
        // Un cliente solo puede ver sus propias solicitudes; para las demás responde "no existe".
        if (s is null || (!Roles.EsPersonal(user.Rol()) && s.UsuarioId != user.UsuarioId()))
            throw ApiException.NoEncontrado($"No existe la solicitud {folio}.");
        return s;
    }

    private static void ExigirEnRevision(Solicitud s)
    {
        if (!EstadosSolicitud.EnRevision.Contains(s.Estado))
            throw ApiException.Conflicto($"La solicitud está \"{s.Estado}\" y ya no está en revisión.");
    }

    private static SolicitudDto ADto(Solicitud s, ClaimsPrincipal user)
        => SolicitudDto.Desde(s, incluirDetalle: true,
            Roles.EsPersonal(user.Rol()) ? null : c => ComunicacionesCliente.Contains(c.Tipo));
}
