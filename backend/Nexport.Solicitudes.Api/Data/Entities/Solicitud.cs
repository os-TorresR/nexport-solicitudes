namespace Nexport.Solicitudes.Api.Data.Entities;

public class Solicitud
{
    public int Id { get; set; }
    public string Folio { get; set; } = "";
    public DateTimeOffset FechaSolicitud { get; set; }
    public string ServicioId { get; set; } = "";
    public string Servicio { get; set; } = "";
    public string Estado { get; set; } = EstadosSolicitud.Ingresada;
    public bool Extraordinaria { get; set; }

    /// <summary>Usuario que creó la solicitud (el cliente ve solo las suyas).</summary>
    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public string Cliente { get; set; } = "";
    public string Solicitante { get; set; } = "";
    public string CorreoSolicitante { get; set; } = "";
    public string? Agencia { get; set; }
    public string? DenominacionOT { get; set; }
    public string? Nave { get; set; }
    public string? Viaje { get; set; }
    public string? LineaNaviera { get; set; }
    public int DiasDemurrage { get; set; }
    public DateOnly FechaRequerida { get; set; }
    public string Turno { get; set; } = "";
    public string? Observaciones { get; set; }
    public DateTimeOffset? ActualizadoEn { get; set; }

    public List<SolicitudItem> Items { get; set; } = [];
    public List<Aprobacion> Aprobaciones { get; set; } = [];
    public List<Comunicacion> Comunicaciones { get; set; } = [];
    public List<HistorialEvento> Historial { get; set; } = [];
}

public static class EstadosSolicitud
{
    public const string Ingresada = "Ingresada";
    public const string PendienteVb = "Pendiente VB";
    public const string InfoSolicitada = "Info solicitada";
    public const string Aprobada = "Aprobada";
    public const string Programada = "Programada";
    public const string EnEjecucion = "En ejecución";
    public const string Finalizada = "Finalizada";

    /// <summary>Estados que esperan revisión / visto bueno de Operación.</summary>
    public static readonly string[] EnRevision = [Ingresada, PendienteVb, InfoSolicitada];

    /// <summary>Aprobada → Programada → En ejecución → Finalizada.</summary>
    public static readonly Dictionary<string, string> Siguiente = new()
    {
        [Aprobada] = Programada,
        [Programada] = EnEjecucion,
        [EnEjecucion] = Finalizada,
    };

    public static readonly string[] Todos = [Ingresada, PendienteVb, InfoSolicitada, Aprobada, Programada, EnEjecucion, Finalizada];
}
