namespace Nexport.Solicitudes.Api.Features.Correo;

/// <summary>Sección "Correo" de appsettings.json.</summary>
public class CorreoOptions
{
    /// <summary>false = modo simulado: los correos se guardan como .eml en <see cref="CarpetaSimulados"/>.</summary>
    public bool Habilitado { get; set; }
    public string Host { get; set; } = "";
    public int Puerto { get; set; } = 587;
    public bool UsarStartTls { get; set; } = true;
    public string Usuario { get; set; } = "";
    public string Password { get; set; } = "";
    public string Remitente { get; set; } = "";
    public string NombreRemitente { get; set; } = "NEXPORT";
    public List<string> AdminDestinatarios { get; set; } = [];
    public string CarpetaSimulados { get; set; } = "correos-simulados";
}
