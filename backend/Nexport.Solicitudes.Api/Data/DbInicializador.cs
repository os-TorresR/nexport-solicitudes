using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Nexport.Solicitudes.Api.Common;
using Nexport.Solicitudes.Api.Data.Entities;
using Nexport.Solicitudes.Api.Features.Plantillas;

namespace Nexport.Solicitudes.Api.Data;

/// <summary>Crea la base (fase piloto), el primer administrador y la plantilla estándar.</summary>
public static class DbInicializador
{
    public static async Task InicializarAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NexportDbContext>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var reloj = scope.ServiceProvider.GetRequiredService<Reloj>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbInicializador");

        if (config.GetValue("BaseDatos:CrearAutomaticamente", true))
        {
            // Crea la base y las tablas si no existen. Para producción conviene pasar a migraciones
            // (dotnet ef migrations add Inicial) y desactivar esta opción.
            await db.Database.EnsureCreatedAsync();
        }

        if (!await db.Usuarios.AnyAsync(u => u.Rol == Roles.Admin))
        {
            var correo = config["AdminInicial:Correo"];
            var password = config["AdminInicial:Password"];
            if (string.IsNullOrWhiteSpace(correo) || string.IsNullOrWhiteSpace(password))
            {
                logger.LogWarning("No hay administrador. Configura AdminInicial:Correo y AdminInicial:Password y reinicia la API.");
            }
            else
            {
                var admin = new Usuario
                {
                    Nombre = config["AdminInicial:Nombre"] ?? "Administrador",
                    Correo = correo.Trim().ToLowerInvariant(),
                    Rol = Roles.Admin,
                    Estado = EstadosUsuario.Activo,
                    CreadoEn = reloj.Ahora(),
                };
                admin.PasswordHash = new PasswordHasher<Usuario>().HashPassword(admin, password);
                db.Usuarios.Add(admin);
                logger.LogInformation("Administrador inicial creado: {Correo}", admin.Correo);
            }
        }

        if (!await db.Plantillas.AnyAsync(p => p.Clave == PlantillasService.ClaveGeneral))
        {
            db.Plantillas.Add(new Plantilla
            {
                Clave = PlantillasService.ClaveGeneral,
                Asunto = PlantillasService.AsuntoEstandar,
                Mensaje = PlantillasService.MensajeEstandar,
                ActualizadoEn = reloj.Ahora(),
                ActualizadoPor = "Sistema",
            });
        }

        await db.SaveChangesAsync();
    }
}
