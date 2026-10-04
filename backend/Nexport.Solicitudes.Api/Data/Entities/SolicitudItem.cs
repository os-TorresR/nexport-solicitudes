namespace Nexport.Solicitudes.Api.Data.Entities;

/// <summary>Ítem de carga de una solicitud (BL/GD, tipo, contenedor, cantidad...).</summary>
public class SolicitudItem
{
    public int Id { get; set; }
    public int SolicitudId { get; set; }
    public int Orden { get; set; }
    public string Bl { get; set; } = "";
    public string Tipo { get; set; } = "";
    public string? IdContenedor { get; set; }
    public string? Dimensiones { get; set; }
    public decimal Cantidad { get; set; }
    public decimal Peso { get; set; }
    public string UnidadMedida { get; set; } = "";
}
