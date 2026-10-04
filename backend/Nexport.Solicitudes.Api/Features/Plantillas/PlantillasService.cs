using Microsoft.EntityFrameworkCore;
using Nexport.Solicitudes.Api.Common;
using Nexport.Solicitudes.Api.Data;
using Nexport.Solicitudes.Api.Data.Entities;

namespace Nexport.Solicitudes.Api.Features.Plantillas;

public class PlantillasService(NexportDbContext db, Reloj reloj)
{
    public const string ClaveGeneral = "general";

    // Plantilla estándar (presentación "Fase inicial", lámina 5).
    public const string AsuntoEstandar = "Solicitud {folio} aprobada · {servicio}";
    public const string MensajeEstandar =
        "Estimado/a {solicitante}:\n\n" +
        "Su solicitud {folio} fue aprobada para {fecha_requerida} · {turno}.\n" +
        "Sector: {sector}. Observaciones: {obs_aprobacion}.\n\n" +
        "Saludos cordiales,\nOperaciones CFS IMPO · NXPORT";

    public async Task<PlantillasDto> ObtenerTodasAsync()
    {
        var todas = await db.Plantillas.AsNoTracking().ToListAsync();
        var general = todas.FirstOrDefault(p => p.Clave == ClaveGeneral);
        return new PlantillasDto(
            general is null ? new PlantillaDto(AsuntoEstandar, MensajeEstandar) : new PlantillaDto(general.Asunto, general.Mensaje),
            todas.Where(p => p.Clave != ClaveGeneral).ToDictionary(p => p.Clave, p => new PlantillaDto(p.Asunto, p.Mensaje)));
    }

    /// <summary>La plantilla propia del servicio si existe; si no, la general.</summary>
    public async Task<PlantillaAplicada> ParaServicioAsync(string servicioId)
    {
        var propia = await db.Plantillas.AsNoTracking().FirstOrDefaultAsync(p => p.Clave == servicioId);
        if (propia is not null)
        {
            var nombre = Catalogo.Servicios.GetValueOrDefault(servicioId, servicioId);
            return new PlantillaAplicada(propia.Asunto, propia.Mensaje, $"Plantilla {nombre}");
        }
        var general = await db.Plantillas.AsNoTracking().FirstOrDefaultAsync(p => p.Clave == ClaveGeneral);
        return new PlantillaAplicada(general?.Asunto ?? AsuntoEstandar, general?.Mensaje ?? MensajeEstandar, "Plantilla general");
    }

    public async Task<PlantillasDto> GuardarAsync(string clave, GuardarPlantillaRequest req, string usuario)
    {
        ValidarClave(clave);
        var campos = new Dictionary<string, string>();
        if (string.IsNullOrWhiteSpace(req.Asunto)) campos["asunto"] = "El asunto es obligatorio.";
        if (string.IsNullOrWhiteSpace(req.Mensaje)) campos["mensaje"] = "El mensaje es obligatorio.";
        Texto.Largo(campos, "asunto", req.Asunto, 250);
        Texto.Largo(campos, "mensaje", req.Mensaje, 4000);
        if (campos.Count > 0) throw ApiException.Validacion(campos, campos.Values.First());

        var plantilla = await db.Plantillas.FirstOrDefaultAsync(p => p.Clave == clave);
        if (plantilla is null)
        {
            plantilla = new Plantilla { Clave = clave };
            db.Plantillas.Add(plantilla);
        }
        plantilla.Asunto = req.Asunto!.Trim();
        plantilla.Mensaje = req.Mensaje!.Trim();
        plantilla.ActualizadoEn = reloj.Ahora();
        plantilla.ActualizadoPor = usuario;
        await db.SaveChangesAsync();
        return await ObtenerTodasAsync();
    }

    /// <summary>"general" vuelve al texto estándar; un servicio vuelve a usar la general.</summary>
    public async Task<PlantillasDto> RestablecerAsync(string clave, string usuario)
    {
        ValidarClave(clave);
        if (clave == ClaveGeneral)
            return await GuardarAsync(ClaveGeneral, new GuardarPlantillaRequest(AsuntoEstandar, MensajeEstandar), usuario);

        var propia = await db.Plantillas.FirstOrDefaultAsync(p => p.Clave == clave);
        if (propia is not null)
        {
            db.Plantillas.Remove(propia);
            await db.SaveChangesAsync();
        }
        return await ObtenerTodasAsync();
    }

    private static void ValidarClave(string clave)
    {
        if (clave != ClaveGeneral && !Catalogo.Servicios.ContainsKey(clave))
            throw ApiException.NoEncontrado($"No existe el servicio '{clave}'.");
    }
}
