using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexport.Solicitudes.Api.Common;

namespace Nexport.Solicitudes.Api.Features.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthService service) : ControllerBase
{
    [HttpPost("registro")]
    [AllowAnonymous]
    public Task<RegistroRespuesta> Registro(RegistroRequest req) => service.RegistrarAsync(req);

    [HttpPost("login")]
    [AllowAnonymous]
    public Task<SesionDto> Login(LoginRequest req) => service.LoginAsync(req);

    [HttpPost("cambiar-password")]
    [Authorize]
    public Task<MensajeDto> CambiarPassword(CambiarPasswordRequest req) => service.CambiarPasswordAsync(User.UsuarioId(), req);

    /// <summary>Usuario de la sesión actual (el front lo usa al recargar la página).</summary>
    [HttpGet("me")]
    [Authorize]
    public Task<UsuarioDto> Me() => service.ObtenerAsync(User.UsuarioId());
}
