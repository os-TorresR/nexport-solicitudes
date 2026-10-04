namespace Nexport.Solicitudes.Api.Data.Entities;

/// <summary>Plantilla de confirmación al cliente. Clave = "general" o el id de un servicio.</summary>
public class Plantilla
{
    public int Id { get; set; }
    public string Clave { get; set; } = "";
    public string Asunto { get; set; } = "";
    public string Mensaje { get; set; } = "";
    public DateTimeOffset ActualizadoEn { get; set; }
    public string? ActualizadoPor { get; set; }
}
