using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexport.Solicitudes.Api.Common;

namespace Nexport.Solicitudes.Api.Features.Solicitudes;

/// <summary>Endpoints de solicitudes (equivale a un @RestController de Spring).</summary>
[ApiController]
[Route("api/solicitudes")]
[Authorize]
public class SolicitudesController(SolicitudesService service) : ControllerBase
{
    /// <summary>Cliente: solo las suyas. Personal: todas. Filtros opcionales ?estado= y ?q=.</summary>
    [HttpGet]
    public Task<List<SolicitudDto>> Listar([FromQuery] string? estado, [FromQuery] string? q)
        => service.ListarAsync(User, estado, q);

    [HttpGet("{folio}")]
    public Task<SolicitudDto> Obtener(string folio) => service.ObtenerAsync(folio, User);

    [HttpPost]
    public async Task<ActionResult<SolicitudDto>> Crear(CrearSolicitudRequest req)
    {
        var creada = await service.CrearAsync(req, User);
        return CreatedAtAction(nameof(Obtener), new { folio = creada.Folio }, creada);
    }

    /// <summary>El cliente corrige su solicitud cuando Operación pidió más información.</summary>
    [HttpPut("{folio}")]
    public Task<SolicitudDto> Actualizar(string folio, ActualizarSolicitudRequest req) => service.ActualizarPorClienteAsync(folio, req, User);

    [HttpPost("{folio}/aprobar")]
    [Authorize(Roles = Roles.Personal)]
    public Task<SolicitudDto> Aprobar(string folio, AprobarRequest req) => service.AprobarAsync(folio, req, User);

    [HttpPost("{folio}/solicitar-info")]
    [Authorize(Roles = Roles.Personal)]
    public Task<SolicitudDto> SolicitarInfo(string folio, SolicitarInfoRequest req) => service.SolicitarInfoAsync(folio, req, User);

    /// <summary>Aprobada → Programada → En ejecución → Finalizada.</summary>
    [HttpPost("{folio}/avanzar")]
    [Authorize(Roles = Roles.Personal)]
    public Task<SolicitudDto> Avanzar(string folio) => service.AvanzarAsync(folio, User);

    [HttpPost("{folio}/comunicaciones/{id:int}/reenviar")]
    [Authorize(Roles = Roles.Personal)]
    public Task<SolicitudDto> Reenviar(string folio, int id) => service.ReenviarComunicacionAsync(folio, id, User);
}
