using System.Security.Claims;

namespace Nexport.Solicitudes.Api.Common;

/// <summary>Lectura de los datos del usuario autenticado desde el token JWT.</summary>
public static class ClaimsExtensions
{
    public static int UsuarioId(this ClaimsPrincipal user)
        => int.Parse(user.FindFirstValue("sub") ?? throw new ApiException(StatusCodes.Status401Unauthorized, "Sesión no válida."));

    public static string Nombre(this ClaimsPrincipal user) => user.FindFirstValue("name") ?? "";

    public static string Rol(this ClaimsPrincipal user) => user.FindFirstValue("role") ?? "";
}
