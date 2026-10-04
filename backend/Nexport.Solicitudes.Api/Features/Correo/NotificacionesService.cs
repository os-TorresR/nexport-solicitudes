using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Nexport.Solicitudes.Api.Common;
using Nexport.Solicitudes.Api.Data;
using Nexport.Solicitudes.Api.Data.Entities;

namespace Nexport.Solicitudes.Api.Features.Correo;

/// <summary>
/// Arma los correos del sistema, los envía y deja registro en la tabla Comunicaciones.
/// Un error de envío no deshace la operación: queda la comunicación con estado "Error" para reintentar.
/// </summary>
public class NotificacionesService(
    NexportDbContext db,
    IEmailSender emailSender,
    IOptions<CorreoOptions> correo,
    IConfiguration config,
    Reloj reloj,
    ILogger<NotificacionesService> logger)
{
    private string UrlFrontend => (config["App:UrlFrontend"] ?? "").TrimEnd('/');

    /// <summary>Destinatarios del aviso al admin: los configurados + los usuarios Admin activos.</summary>
    public async Task<List<string>> DestinatariosAdminAsync()
    {
        var admins = await db.Usuarios
            .Where(u => u.Rol == Roles.Admin && u.Estado == EstadosUsuario.Activo)
            .Select(u => u.Correo)
            .ToListAsync();
        return correo.Value.AdminDestinatarios
            .Concat(admins)
            .Where(c => !string.IsNullOrWhiteSpace(c))
            .Select(c => c.Trim().ToLowerInvariant())
            .Distinct()
            .ToList();
    }

    public async Task AvisarNuevaSolicitudAsync(Solicitud s)
    {
        var destinatarios = await DestinatariosAdminAsync();
        var asunto = $"Nueva solicitud {s.Folio} · {s.Servicio}" + (s.Extraordinaria ? " · EXTRAORDINARIA (requiere VB)" : "");
        var cuerpo = $"""
            Se ingresó una nueva solicitud de servicio.

            Folio: {s.Folio}
            Servicio: {s.Servicio}
            Cliente: {s.Cliente}
            Solicitante: {s.Solicitante} ({s.CorreoSolicitante})
            Fecha requerida: {s.FechaRequerida:dd-MM-yyyy} · {s.Turno}
            Ítems de carga: {s.Items.Count}
            Ingreso: {s.FechaSolicitud:dd-MM-yyyy HH:mm}
            {(s.Extraordinaria ? $"\nIngresó después de las {reloj.HoraCorte}:00: requiere visto bueno del Jefe de Turno.\n" : "")}
            Revisar: {UrlFrontend}/operacion/solicitudes/{Uri.EscapeDataString(s.Folio)}
            """;
        await RegistrarYEnviarAsync(s.Id, TiposComunicacion.AvisoAdmin, destinatarios, asunto, cuerpo, null);
    }

    /// <summary>Aviso al admin: el cliente agregó la información pedida y la solicitud vuelve a revisión.</summary>
    public async Task AvisarSolicitudCorregidaAsync(Solicitud s, string comentario)
    {
        var destinatarios = await DestinatariosAdminAsync();
        var asunto = $"Solicitud {s.Folio} corregida por el cliente · vuelve a revisión";
        var cuerpo = $"""
            {s.Solicitante} ({s.Cliente}) agregó la información solicitada.

            Folio: {s.Folio}
            Servicio: {s.Servicio}
            Comentario del cliente:
            {comentario}

            Revisar: {UrlFrontend}/operacion/solicitudes/{Uri.EscapeDataString(s.Folio)}
            """;
        await RegistrarYEnviarAsync(s.Id, TiposComunicacion.AvisoActualizacion, destinatarios, asunto, cuerpo, null);
    }

    /// <summary>Acuse de recibo al solicitante: confirma que la solicitud quedó registrada con su folio.</summary>
    public async Task AcusarReciboAsync(Solicitud s)
    {
        var asunto = $"Recibimos tu solicitud {s.Folio} · {s.Servicio}";
        var cuerpo = $"""
            Estimado/a {s.Solicitante}:

            Recibimos su solicitud de servicio y quedó registrada con el folio {s.Folio}.

            Servicio: {s.Servicio}
            Cliente: {s.Cliente}
            Fecha requerida: {s.FechaRequerida:dd-MM-yyyy} · {s.Turno}
            Ítems de carga: {s.Items.Count}
            Estado: {s.Estado}
            {(s.Extraordinaria ? $"\nIngresó después de las {reloj.HoraCorte}:00, por lo que requiere el visto bueno del Jefe de Turno.\n" : "")}
            Le enviaremos otro correo cuando la solicitud sea revisada. Puede seguir su estado en:
            {UrlFrontend}/solicitudes/{Uri.EscapeDataString(s.Folio)}

            Operaciones CFS IMPO · Ultraport
            """;
        await RegistrarYEnviarAsync(s.Id, TiposComunicacion.AcuseCliente, [s.CorreoSolicitante], asunto, cuerpo, null);
    }

    public Task<Comunicacion> EnviarConfirmacionAsync(Solicitud s, string asunto, string mensaje, string plantilla)
        => RegistrarYEnviarAsync(s.Id, TiposComunicacion.ConfirmacionCliente, [s.CorreoSolicitante], asunto, mensaje, plantilla);

    public Task<Comunicacion> AvisarInfoSolicitadaAsync(Solicitud s, string observacion, string responsable)
    {
        var asunto = $"Solicitud {s.Folio}: necesitamos más información";
        var cuerpo = $"""
            Estimado/a {s.Solicitante}:

            Para continuar con su solicitud {s.Folio} ({s.Servicio}) necesitamos la siguiente información:

            {observacion}

            Puede responder a este correo indicando el folio o revisar el estado en:
            {UrlFrontend}/solicitudes/{Uri.EscapeDataString(s.Folio)}

            Saludos cordiales,
            {responsable}
            Operaciones CFS IMPO · Ultraport
            """;
        return RegistrarYEnviarAsync(s.Id, TiposComunicacion.InfoSolicitada, [s.CorreoSolicitante], asunto, cuerpo, null);
    }

    public async Task AvisarNuevoUsuarioAsync(Usuario u, bool activadoAutomaticamente)
    {
        var destinatarios = await DestinatariosAdminAsync();
        var asunto = activadoAutomaticamente ? $"Nuevo usuario registrado: {u.Nombre}" : $"Nuevo usuario por aprobar: {u.Nombre}";
        var accion = activadoAutomaticamente
            ? "La cuenta quedó activa automáticamente. Puedes revisarla o desactivarla en"
            : "Para activarla entra a";
        var cuerpo = $"""
            Se registró un nuevo usuario en el portal de solicitudes.

            Nombre: {u.Nombre}
            Empresa: {u.Empresa ?? "—"}
            Correo: {u.Correo}
            Teléfono: {u.Telefono ?? "—"}

            {accion}: {UrlFrontend}/operacion/usuarios
            """;
        await RegistrarYEnviarAsync(null, TiposComunicacion.AvisoRegistro, destinatarios, asunto, cuerpo, null);
    }

    public async Task AvisarCuentaActivadaAsync(Usuario u)
    {
        var asunto = "Tu cuenta NEXPORT fue activada";
        var cuerpo = $"""
            Hola {u.Nombre}:

            Tu cuenta del portal de solicitudes de servicios CFS IMPO ya está activa.
            Ingresa en: {UrlFrontend}/ingresar

            Operaciones CFS IMPO · Ultraport
            """;
        await RegistrarYEnviarAsync(null, TiposComunicacion.CuentaActivada, [u.Correo], asunto, cuerpo, null);
    }

    /// <summary>Vuelve a enviar una comunicación que quedó con error.</summary>
    public async Task ReenviarAsync(Comunicacion c)
    {
        // Los avisos al admin se recalculan (puede haber cambiado la lista de administradores).
        IReadOnlyCollection<string> destinatarios = c.Tipo is TiposComunicacion.AvisoAdmin or TiposComunicacion.AvisoRegistro or TiposComunicacion.AvisoActualizacion
            ? await DestinatariosAdminAsync()
            : c.Destinatario.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
        if (destinatarios.Count > 0) c.Destinatario = Corta(string.Join(", ", destinatarios), 500);
        await EnviarYActualizarAsync(c, destinatarios);
    }

    private static string Corta(string valor, int max) => valor.Length <= max ? valor : valor[..max];

    private async Task<Comunicacion> RegistrarYEnviarAsync(int? solicitudId, string tipo, IReadOnlyCollection<string> destinatarios, string asunto, string mensaje, string? plantilla)
    {
        var c = new Comunicacion
        {
            SolicitudId = solicitudId,
            Tipo = tipo,
            Destinatario = destinatarios.Count == 0 ? "(sin destinatarios)" : Corta(string.Join(", ", destinatarios), 500),
            Asunto = Corta(asunto, 300),
            Mensaje = mensaje,
            Plantilla = plantilla,
            FechaHora = reloj.Ahora(),
        };
        try
        {
            db.Comunicaciones.Add(c);
            await EnviarYActualizarAsync(c, destinatarios);
        }
        catch (Exception ex)
        {
            // Nunca debe romper la operación principal (la solicitud o el usuario ya quedaron guardados).
            logger.LogError(ex, "No se pudo registrar la comunicación '{Asunto}'", c.Asunto);
            if (solicitudId is not null)
            {
                var solicitud = db.ChangeTracker.Entries<Solicitud>().FirstOrDefault(e => e.Entity.Id == solicitudId)?.Entity;
                solicitud?.Comunicaciones.Remove(c);
            }
            db.Entry(c).State = EntityState.Detached;
            c.EstadoEnvio = EstadosEnvio.Error;
            c.Error = Corta(ex.Message, 1000);
        }
        return c;
    }

    private async Task EnviarYActualizarAsync(Comunicacion c, IReadOnlyCollection<string> destinatarios)
    {
        var resultado = await emailSender.EnviarAsync(destinatarios, c.Asunto, c.Mensaje);
        c.EstadoEnvio = resultado.Ok ? (resultado.Simulado ? EstadosEnvio.Simulado : EstadosEnvio.Enviado) : EstadosEnvio.Error;
        c.Error = resultado.Ok ? null : Corta(resultado.Error ?? "Error desconocido", 1000);
        c.EnviadoEn = resultado.Ok ? reloj.Ahora() : null;
        await db.SaveChangesAsync();
    }
}
