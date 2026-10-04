namespace Nexport.Solicitudes.Api.Data.Entities;

/// <summary>Trazabilidad: cada acción sobre una solicitud.</summary>
public class HistorialEvento
{
    public int Id { get; set; }
    public int SolicitudId { get; set; }
    public DateTimeOffset FechaHora { get; set; }
    public string Accion { get; set; } = "";
    public string? Detalle { get; set; }
    public string? Usuario { get; set; }
}
