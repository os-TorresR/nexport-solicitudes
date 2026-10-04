using System.Text.Json.Serialization;
using Nexport.Solicitudes.Api.Data.Entities;

namespace Nexport.Solicitudes.Api.Features.Solicitudes;

// ---------- Entrada (lo que envía el frontend) ----------

public record ItemRequest(string? Bl, string? Tipo, string? Id, string? Dim, decimal? Cantidad, decimal? Peso, string? Um);

public record CrearSolicitudRequest(
    string? ServicioId,
    string? Cliente,
    string? Solicitante,
    string? CorreoSolicitante,
    string? Agencia,
    string? DenominacionOT,
    string? Nave,
    string? Viaje,
    string? LineaNaviera,
    int? DiasDemurrage,
    string? FechaRequerida,
    string? Turno,
    string? Observaciones,
    List<ItemRequest>? Items);

/// <summary>El cliente corrige su solicitud cuando Operación le pidió más información.</summary>
public record ActualizarSolicitudRequest(
    string? Cliente,
    string? Solicitante,
    string? CorreoSolicitante,
    string? Agencia,
    string? DenominacionOT,
    string? Nave,
    string? Viaje,
    string? LineaNaviera,
    int? DiasDemurrage,
    string? FechaRequerida,
    string? Turno,
    string? Observaciones,
    List<ItemRequest>? Items,
    string? Comentario);

public record AprobarRequest(string? TurnoConfirmado, string? Sector, string? Observacion);

public record SolicitarInfoRequest(string? Observacion);

// ---------- Salida (misma forma que usa el frontend) ----------

public record ItemDto(string Bl, string Tipo, string? Id, string? Dim, decimal Cantidad, decimal Peso, string Um);

public record AprobacionDto(string Resultado, string Responsable, string? TurnoConfirmado, string? Sector, string? Observacion, DateTimeOffset FechaHora);

public record ComunicacionDto(int Id, string Tipo, string? Plantilla, string Destinatario, string Asunto, string Mensaje, DateTimeOffset FechaHora, string EstadoEnvio, DateTimeOffset? EnviadaEn, string? Error);

public record HistorialDto(DateTimeOffset FechaHora, string Accion, string? Detalle, string? Usuario);

public record SolicitudDto(
    string Folio,
    DateTimeOffset FechaSolicitud,
    string ServicioId,
    string Servicio,
    string Estado,
    bool Extraordinaria,
    string Cliente,
    string Solicitante,
    string CorreoSolicitante,
    string? Agencia,
    [property: JsonPropertyName("denominacionOT")] string? DenominacionOT,
    string? Nave,
    string? Viaje,
    string? LineaNaviera,
    int DiasDemurrage,
    DateOnly FechaRequerida,
    string Turno,
    string? Observaciones,
    List<ItemDto> Items,
    AprobacionDto? Aprobacion,
    List<ComunicacionDto> Comunicaciones,
    List<HistorialDto> Historial)
{
    public static SolicitudDto Desde(Solicitud s, bool incluirDetalle, Func<Comunicacion, bool>? filtroComunicaciones = null)
    {
        var aprobacion = s.Aprobaciones.OrderByDescending(a => a.FechaHora).ThenByDescending(a => a.Id).FirstOrDefault();
        return new SolicitudDto(
            s.Folio, s.FechaSolicitud, s.ServicioId, s.Servicio, s.Estado, s.Extraordinaria,
            s.Cliente, s.Solicitante, s.CorreoSolicitante, s.Agencia, s.DenominacionOT, s.Nave, s.Viaje, s.LineaNaviera,
            s.DiasDemurrage, s.FechaRequerida, s.Turno, s.Observaciones,
            s.Items.OrderBy(i => i.Orden)
                .Select(i => new ItemDto(i.Bl, i.Tipo, i.IdContenedor, i.Dimensiones, i.Cantidad, i.Peso, i.UnidadMedida))
                .ToList(),
            aprobacion is null ? null : new AprobacionDto(aprobacion.Resultado, aprobacion.Responsable, aprobacion.TurnoConfirmado, aprobacion.Sector, aprobacion.Observacion, aprobacion.FechaHora),
            incluirDetalle
                ? s.Comunicaciones.Where(filtroComunicaciones ?? (_ => true)).OrderBy(c => c.FechaHora).ThenBy(c => c.Id)
                    .Select(c => new ComunicacionDto(c.Id, c.Tipo, c.Plantilla, c.Destinatario, c.Asunto, c.Mensaje, c.FechaHora, c.EstadoEnvio, c.EnviadoEn, c.Error))
                    .ToList()
                : [],
            incluirDetalle
                ? s.Historial.OrderBy(h => h.FechaHora).ThenBy(h => h.Id).Select(h => new HistorialDto(h.FechaHora, h.Accion, h.Detalle, h.Usuario)).ToList()
                : []);
    }
}
