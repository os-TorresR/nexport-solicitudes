namespace Nexport.Solicitudes.Api.Common;

/// <summary>
/// Hora oficial de la operación (America/Santiago), independiente de la zona del servidor.
/// La regla de las 15:00 y el folio usan esta hora.
/// </summary>
public class Reloj
{
    private readonly TimeZoneInfo _zona;
    public int HoraCorte { get; }

    public Reloj(IConfiguration config)
    {
        _zona = BuscarZona(config["Operacion:ZonaHoraria"] ?? "America/Santiago");
        HoraCorte = config.GetValue("Operacion:HoraCorte", 15);
    }

    /// <summary>Ahora, con el desfase horario de Chile.</summary>
    public DateTimeOffset Ahora() => TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, _zona);

    public DateOnly Hoy() => DateOnly.FromDateTime(Ahora().DateTime);

    public bool EsExtraordinaria(DateTimeOffset momento) => momento.Hour >= HoraCorte;

    private static TimeZoneInfo BuscarZona(string id)
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(id);
        }
        catch (TimeZoneNotFoundException)
        {
            // Nombre de Windows para Chile continental.
            return TimeZoneInfo.FindSystemTimeZoneById("Pacific SA Standard Time");
        }
    }
}
