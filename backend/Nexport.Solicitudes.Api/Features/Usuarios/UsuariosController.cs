using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexport.Solicitudes.Api.Common;
using Nexport.Solicitudes.Api.Features.Auth;

namespace Nexport.Solicitudes.Api.Features.Usuarios;

[ApiController]
[Route("api/usuarios")]
[Authorize(Roles = Roles.Admin)]
public class UsuariosController(UsuariosService service) : ControllerBase
{
    [HttpGet]
    public Task<List<UsuarioDto>> Listar() => service.ListarAsync();

    [HttpPatch("{id:int}")]
    public Task<UsuarioDto> Actualizar(int id, ActualizarUsuarioRequest req) => service.ActualizarAsync(id, req, User.UsuarioId());
}
