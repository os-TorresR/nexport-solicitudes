namespace Nexport.Solicitudes.Api.Data.Entities;

/// <summary>Registro de cada correo generado: al admin, al cliente, avisos de registro.</summary>
public class Comunicacion
{
    public int Id { get; set; }

    /// <summary>Nulo para avisos que no son de una solicitud (por ejemplo, un registro de usuario).</summary>
    public int? SolicitudId { get; set; }

    public string Tipo { get; set; } = "";
    public string Destinatario { get; set; } = "";
    public string Asunto { get; set; } = "";
    public string Mensaje { get; set; } = "";
    public string? Plantilla { get; set; }

    /// <summary>Pendiente, Enviado, Simulado (SMTP deshabilitado) o Error.</summary>
    public string EstadoEnvio { get; set; } = EstadosEnvio.Pendiente;
    public string? Error { get; set; }
    public DateTimeOffset FechaHora { get; set; }
    public DateTimeOffset? EnviadoEn { get; set; }
}

public static class EstadosEnvio
{
    public const string Pendiente = "Pendiente";
    public const string Enviado = "Enviado";
    public const string Simulado = "Simulado";
    public const string Error = "Error";
}

public static class TiposComunicacion
{
    public const string AvisoAdmin = "Aviso al admin: nueva solicitud";
    public const string AcuseCliente = "Acuse de recibo al solicitante";
    public const string ConfirmacionCliente = "Confirmación al cliente";
    public const string InfoSolicitada = "Información solicitada al cliente";
    public const string AvisoRegistro = "Aviso al admin: nuevo usuario";
    public const string AvisoActualizacion = "Aviso al admin: solicitud corregida";
    public const string CuentaActivada = "Aviso al usuario: cuenta activada";
}
