using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Nexport.Solicitudes.Api.Common;
using Nexport.Solicitudes.Api.Data;
using Nexport.Solicitudes.Api.Data.Entities;
using Nexport.Solicitudes.Api.Features.Correo;

namespace Nexport.Solicitudes.Api.Features.Auth;

public class AuthService(
    NexportDbContext db,
    TokenService tokens,
    NotificacionesService notificaciones,
    IConfiguration config,
    Reloj reloj)
{
    private static readonly PasswordHasher<Usuario> Hasher = new();

    public async Task<RegistroRespuesta> RegistrarAsync(RegistroRequest req)
    {
        var correo = Texto.Requerido(req.Correo).ToLowerInvariant();
        var campos = new Dictionary<string, string>();
        if (string.IsNullOrWhiteSpace(req.Nombre)) campos["nombre"] = "Ingresa tu nombre.";
        if (string.IsNullOrWhiteSpace(req.Empresa)) campos["empresa"] = "Ingresa tu empresa.";
        if (!Texto.EsCorreo(correo)) campos["correo"] = "Ingresa un correo válido.";
        if ((req.Password ?? "").Length < 8) campos["password"] = "La contraseña debe tener al menos 8 caracteres.";
        Texto.Largo(campos, "nombre", req.Nombre, 150);
        Texto.Largo(campos, "empresa", req.Empresa, 150);
        Texto.Largo(campos, "correo", req.Correo, 150);
        Texto.Largo(campos, "telefono", req.Telefono, 30);
        Texto.Largo(campos, "password", req.Password, 200);
        if (campos.Count > 0) throw ApiException.Validacion(campos);

        if (await db.Usuarios.AnyAsync(u => u.Correo == correo))
            throw ApiException.Validacion(new Dictionary<string, string> { ["correo"] = "Ya existe una cuenta con este correo." }, "Ya existe una cuenta con este correo.");

        var requiereAprobacion = RequiereAprobacion(correo);
        var usuario = new Usuario
        {
            Nombre = Texto.Requerido(req.Nombre),
            Empresa = Texto.Limpio(req.Empresa),
            Correo = correo,
            Telefono = Texto.Limpio(req.Telefono),
            Rol = Roles.Cliente,
            Estado = requiereAprobacion ? EstadosUsuario.Pendiente : EstadosUsuario.Activo,
            CreadoEn = reloj.Ahora(),
        };
        usuario.PasswordHash = Hasher.HashPassword(usuario, req.Password!);
        db.Usuarios.Add(usuario);
        await db.SaveChangesAsync();

        await notificaciones.AvisarNuevoUsuarioAsync(usuario, activadoAutomaticamente: !requiereAprobacion);
        if (requiereAprobacion)
        {
            return new RegistroRespuesta(
                "Tu cuenta fue creada. Un administrador debe activarla; te avisaremos por correo cuando puedas ingresar.",
                true, null);
        }
        return new RegistroRespuesta("Tu cuenta fue creada.", false, await CrearSesionAsync(usuario));
    }

    /// <summary>
    /// Registro:RequiereAprobacion = false: todas las cuentas quedan activas.
    /// Si es true, se activan solas las de Registro:DominiosAutoAprobados (ej. "bridgestone.cl"); el resto espera al admin.
    /// </summary>
    private bool RequiereAprobacion(string correo)
    {
        if (!config.GetValue("Registro:RequiereAprobacion", true)) return false;
        var dominio = correo[(correo.LastIndexOf('@') + 1)..];
        var autorizados = config.GetSection("Registro:DominiosAutoAprobados").Get<string[]>() ?? [];
        return !autorizados.Any(d => string.Equals(d.Trim().TrimStart('@'), dominio, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<MensajeDto> CambiarPasswordAsync(int usuarioId, CambiarPasswordRequest req)
    {
        var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == usuarioId)
            ?? throw new ApiException(StatusCodes.Status401Unauthorized, "Sesión no válida.");

        var campos = new Dictionary<string, string>();
        if (string.IsNullOrEmpty(req.PasswordActual)
            || Hasher.VerifyHashedPassword(usuario, usuario.PasswordHash, req.PasswordActual) == PasswordVerificationResult.Failed)
            campos["passwordActual"] = "La contraseña actual no es correcta.";
        if ((req.PasswordNueva ?? "").Length < 8) campos["passwordNueva"] = "La nueva contraseña debe tener al menos 8 caracteres.";
        else if (req.PasswordNueva == req.PasswordActual) campos["passwordNueva"] = "La nueva contraseña debe ser distinta a la actual.";
        Texto.Largo(campos, "passwordNueva", req.PasswordNueva, 200);
        if (campos.Count > 0) throw ApiException.Validacion(campos);

        usuario.PasswordHash = Hasher.HashPassword(usuario, req.PasswordNueva!);
        await db.SaveChangesAsync();
        return new MensajeDto("Tu contraseña fue actualizada.");
    }

    public async Task<SesionDto> LoginAsync(LoginRequest req)
    {
        var correo = Texto.Requerido(req.Correo).ToLowerInvariant();
        var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Correo == correo);
        var credencialesInvalidas = new ApiException(StatusCodes.Status401Unauthorized, "Correo o contraseña incorrectos.");
        if (usuario is null || string.IsNullOrEmpty(req.Password)) throw credencialesInvalidas;

        var verificacion = Hasher.VerifyHashedPassword(usuario, usuario.PasswordHash, req.Password);
        if (verificacion == PasswordVerificationResult.Failed) throw credencialesInvalidas;
        if (verificacion == PasswordVerificationResult.SuccessRehashNeeded)
            usuario.PasswordHash = Hasher.HashPassword(usuario, req.Password);

        if (usuario.Estado == EstadosUsuario.Pendiente)
            throw ApiException.Prohibido("Tu cuenta aún no ha sido activada por un administrador.");
        if (usuario.Estado != EstadosUsuario.Activo)
            throw ApiException.Prohibido("Tu cuenta está desactivada. Contacta al administrador.");

        return await CrearSesionAsync(usuario);
    }

    public async Task<UsuarioDto> ObtenerAsync(int id)
    {
        var usuario = await db.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new ApiException(StatusCodes.Status401Unauthorized, "Sesión no válida.");
        if (usuario.Estado != EstadosUsuario.Activo) throw new ApiException(StatusCodes.Status401Unauthorized, "Tu cuenta no está activa.");
        return UsuarioDto.Desde(usuario);
    }

    private async Task<SesionDto> CrearSesionAsync(Usuario usuario)
    {
        usuario.UltimoIngreso = reloj.Ahora();
        await db.SaveChangesAsync();
        var (token, expira) = tokens.Crear(usuario);
        return new SesionDto(token, expira, UsuarioDto.Desde(usuario));
    }
}
