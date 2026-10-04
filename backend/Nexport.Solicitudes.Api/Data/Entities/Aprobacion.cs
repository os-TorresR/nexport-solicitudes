namespace Nexport.Solicitudes.Api.Data.Entities;

/// <summary>Cada revisión de Operación: aprobación (VB) o solicitud de información.</summary>
public class Aprobacion
{
    public int Id { get; set; }
    public int SolicitudId { get; set; }

    /// <summary>APROBADA o INFO_SOLICITADA.</summary>
    public string Resultado { get; set; } = "";
    public int UsuarioId { get; set; }
    public string Responsable { get; set; } = "";
    public string? TurnoConfirmado { get; set; }
    public string? Sector { get; set; }
    public string? Observacion { get; set; }
    public DateTimeOffset FechaHora { get; set; }
}

public static class ResultadosAprobacion
{
    public const string Aprobada = "APROBADA";
    public const string InfoSolicitada = "INFO_SOLICITADA";
}
