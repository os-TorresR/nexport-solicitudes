using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexport.Solicitudes.Api.Common;

namespace Nexport.Solicitudes.Api.Features.Plantillas;

[ApiController]
[Route("api/plantillas")]
[Authorize(Roles = Roles.Personal)]
public class PlantillasController(PlantillasService service) : ControllerBase
{
    [HttpGet]
    public Task<PlantillasDto> Obtener() => service.ObtenerTodasAsync();

    /// <summary>clave = "general" o el id del servicio (ej. "carguio").</summary>
    [HttpPut("{clave}")]
    [Authorize(Roles = Roles.Supervisores)]
    public Task<PlantillasDto> Guardar(string clave, GuardarPlantillaRequest req) => service.GuardarAsync(clave, req, User.Nombre());

    [HttpDelete("{clave}")]
    [Authorize(Roles = Roles.Supervisores)]
    public Task<PlantillasDto> Restablecer(string clave) => service.RestablecerAsync(clave, User.Nombre());
}
