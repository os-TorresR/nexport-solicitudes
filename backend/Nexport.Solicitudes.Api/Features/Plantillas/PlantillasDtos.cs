namespace Nexport.Solicitudes.Api.Features.Plantillas;

public record PlantillaDto(string Asunto, string Mensaje);

/// <summary>Misma forma que usa el frontend: { general, porServicio: { carguio: {...} } }.</summary>
public record PlantillasDto(PlantillaDto General, Dictionary<string, PlantillaDto> PorServicio);

public record GuardarPlantillaRequest(string? Asunto, string? Mensaje);

public record PlantillaAplicada(string Asunto, string Mensaje, string Origen);
