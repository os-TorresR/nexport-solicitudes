using Microsoft.EntityFrameworkCore;
using Nexport.Solicitudes.Api.Common;
using Nexport.Solicitudes.Api.Data;
using Nexport.Solicitudes.Api.Data.Entities;
using Nexport.Solicitudes.Api.Features.Auth;
using Nexport.Solicitudes.Api.Features.Correo;

namespace Nexport.Solicitudes.Api.Features.Usuarios;

public class UsuariosService(NexportDbContext db, NotificacionesService notificaciones)
{
    public async Task<List<UsuarioDto>> ListarAsync()
    {
        var usuarios = await db.Usuarios.AsNoTracking()
            .OrderBy(u => u.Estado == EstadosUsuario.Pendiente ? 0 : 1)
            .ThenBy(u => u.Nombre)
            .ToListAsync();
        return usuarios.Select(UsuarioDto.Desde).ToList();
    }

    public async Task<UsuarioDto> ActualizarAsync(int id, ActualizarUsuarioRequest req, int adminId)
    {
        var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == id)
            ?? throw ApiException.NoEncontrado("El usuario no existe.");

        if (req.Rol is not null && !Roles.Todos.Contains(req.Rol))
            throw ApiException.Validacion(new Dictionary<string, string> { ["rol"] = "Rol no válido." });
        if (req.Estado is not null && !EstadosUsuario.Todos.Contains(req.Estado))
            throw ApiException.Validacion(new Dictionary<string, string> { ["estado"] = "Estado no válido." });

        // Evita que el sistema quede sin administradores activos.
        var dejaDeSerAdminActivo = usuario.Rol == Roles.Admin && usuario.Estado == EstadosUsuario.Activo
            && ((req.Rol is not null && req.Rol != Roles.Admin) || (req.Estado is not null && req.Estado != EstadosUsuario.Activo));
        if (dejaDeSerAdminActivo)
        {
            var otrosAdmins = await db.Usuarios.CountAsync(u => u.Id != id && u.Rol == Roles.Admin && u.Estado == EstadosUsuario.Activo);
            if (otrosAdmins == 0) throw ApiException.Conflicto("Debe quedar al menos un administrador activo.");
            if (id == adminId) throw ApiException.Conflicto("No puedes quitarte tu propio rol de administrador ni desactivarte.");
        }

        var seActiva = usuario.Estado == EstadosUsuario.Pendiente && req.Estado == EstadosUsuario.Activo;
        if (req.Rol is not null) usuario.Rol = req.Rol;
        if (req.Estado is not null) usuario.Estado = req.Estado;
        await db.SaveChangesAsync();

        if (seActiva) await notificaciones.AvisarCuentaActivadaAsync(usuario);
        return UsuarioDto.Desde(usuario);
    }
}
