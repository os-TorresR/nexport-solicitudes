using Nexport.Solicitudes.Api.Data.Entities;

namespace Nexport.Solicitudes.Api.Features.Auth;

public record RegistroRequest(string? Nombre, string? Empresa, string? Correo, string? Telefono, string? Password);

public record LoginRequest(string? Correo, string? Password);

public record CambiarPasswordRequest(string? PasswordActual, string? PasswordNueva);

public record MensajeDto(string Mensaje);

public record UsuarioDto(int Id, string Nombre, string Correo, string? Empresa, string? Telefono, string Rol, string Estado, DateTimeOffset CreadoEn, DateTimeOffset? UltimoIngreso)
{
    public static UsuarioDto Desde(Usuario u) => new(u.Id, u.Nombre, u.Correo, u.Empresa, u.Telefono, u.Rol, u.Estado, u.CreadoEn, u.UltimoIngreso);
}

public record SesionDto(string Token, DateTimeOffset Expira, UsuarioDto Usuario);

/// <summary>Respuesta del registro: con sesión si la cuenta queda activa, o solo el mensaje si espera aprobación.</summary>
public record RegistroRespuesta(string Mensaje, bool RequiereAprobacion, SesionDto? Sesion);
