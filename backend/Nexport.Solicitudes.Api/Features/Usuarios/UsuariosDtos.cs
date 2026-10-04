namespace Nexport.Solicitudes.Api.Features.Usuarios;

/// <summary>Cambios que puede hacer el admin: rol y/o estado (Pendiente, Activo, Inactivo).</summary>
public record ActualizarUsuarioRequest(string? Rol, string? Estado);
