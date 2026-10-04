using Microsoft.EntityFrameworkCore;
using Nexport.Solicitudes.Api.Data.Entities;

namespace Nexport.Solicitudes.Api.Data;

/// <summary>
/// Conexión a SQL Server y definición de las tablas (equivale a los JpaRepository + la configuración JPA).
/// </summary>
public class NexportDbContext(DbContextOptions<NexportDbContext> options) : DbContext(options)
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Solicitud> Solicitudes => Set<Solicitud>();
    public DbSet<SolicitudItem> SolicitudItems => Set<SolicitudItem>();
    public DbSet<Aprobacion> Aprobaciones => Set<Aprobacion>();
    public DbSet<Comunicacion> Comunicaciones => Set<Comunicacion>();
    public DbSet<HistorialEvento> Historial => Set<HistorialEvento>();
    public DbSet<Plantilla> Plantillas => Set<Plantilla>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Usuario>(e =>
        {
            e.ToTable("Usuarios");
            e.Property(x => x.Nombre).HasMaxLength(150).IsRequired();
            e.Property(x => x.Correo).HasMaxLength(150).IsRequired();
            e.HasIndex(x => x.Correo).IsUnique();
            e.Property(x => x.Empresa).HasMaxLength(150);
            e.Property(x => x.Telefono).HasMaxLength(30);
            e.Property(x => x.PasswordHash).HasMaxLength(500).IsRequired();
            e.Property(x => x.Rol).HasMaxLength(20).IsRequired();
            e.Property(x => x.Estado).HasMaxLength(20).IsRequired();
        });

        mb.Entity<Solicitud>(e =>
        {
            e.ToTable("Solicitudes");
            e.Property(x => x.Folio).HasMaxLength(30).IsRequired();
            e.HasIndex(x => x.Folio).IsUnique();
            e.Property(x => x.ServicioId).HasMaxLength(40).IsRequired();
            e.Property(x => x.Servicio).HasMaxLength(60).IsRequired();
            e.Property(x => x.Estado).HasMaxLength(30).IsRequired();
            e.HasIndex(x => x.Estado);
            e.HasIndex(x => x.FechaSolicitud);
            e.Property(x => x.Cliente).HasMaxLength(150).IsRequired();
            e.Property(x => x.Solicitante).HasMaxLength(150).IsRequired();
            e.Property(x => x.CorreoSolicitante).HasMaxLength(150).IsRequired();
            e.Property(x => x.Agencia).HasMaxLength(150);
            e.Property(x => x.DenominacionOT).HasMaxLength(200);
            e.Property(x => x.Nave).HasMaxLength(100);
            e.Property(x => x.Viaje).HasMaxLength(50);
            e.Property(x => x.LineaNaviera).HasMaxLength(100);
            e.Property(x => x.Turno).HasMaxLength(20).IsRequired();
            e.Property(x => x.Observaciones).HasMaxLength(2000);

            e.HasOne(x => x.Usuario).WithMany().HasForeignKey(x => x.UsuarioId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(x => x.Items).WithOne().HasForeignKey(x => x.SolicitudId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.Aprobaciones).WithOne().HasForeignKey(x => x.SolicitudId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.Comunicaciones).WithOne().HasForeignKey(x => x.SolicitudId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.Historial).WithOne().HasForeignKey(x => x.SolicitudId).OnDelete(DeleteBehavior.Cascade);
        });

        mb.Entity<SolicitudItem>(e =>
        {
            e.ToTable("SolicitudItems");
            e.Property(x => x.Bl).HasMaxLength(60).IsRequired();
            e.Property(x => x.Tipo).HasMaxLength(100).IsRequired();
            e.Property(x => x.IdContenedor).HasMaxLength(30);
            e.Property(x => x.Dimensiones).HasMaxLength(60);
            e.Property(x => x.Cantidad).HasPrecision(12, 2);
            e.Property(x => x.Peso).HasPrecision(14, 2);
            e.Property(x => x.UnidadMedida).HasMaxLength(20).IsRequired();
        });

        mb.Entity<Aprobacion>(e =>
        {
            e.ToTable("Aprobaciones");
            e.Property(x => x.Resultado).HasMaxLength(20).IsRequired();
            e.Property(x => x.Responsable).HasMaxLength(150).IsRequired();
            e.Property(x => x.TurnoConfirmado).HasMaxLength(20);
            e.Property(x => x.Sector).HasMaxLength(100);
            e.Property(x => x.Observacion).HasMaxLength(1000);
            e.HasOne<Usuario>().WithMany().HasForeignKey(x => x.UsuarioId).OnDelete(DeleteBehavior.Restrict);
        });

        mb.Entity<Comunicacion>(e =>
        {
            e.ToTable("Comunicaciones");
            e.Property(x => x.Tipo).HasMaxLength(60).IsRequired();
            e.Property(x => x.Destinatario).HasMaxLength(500).IsRequired();
            e.Property(x => x.Asunto).HasMaxLength(300).IsRequired();
            e.Property(x => x.Mensaje).IsRequired();
            e.Property(x => x.Plantilla).HasMaxLength(100);
            e.Property(x => x.EstadoEnvio).HasMaxLength(20).IsRequired();
            e.Property(x => x.Error).HasMaxLength(1000);
        });

        mb.Entity<HistorialEvento>(e =>
        {
            e.ToTable("HistorialSolicitudes");
            e.Property(x => x.Accion).HasMaxLength(150).IsRequired();
            e.Property(x => x.Detalle).HasMaxLength(1000);
            e.Property(x => x.Usuario).HasMaxLength(150);
        });

        mb.Entity<Plantilla>(e =>
        {
            e.ToTable("Plantillas");
            e.Property(x => x.Clave).HasMaxLength(40).IsRequired();
            e.HasIndex(x => x.Clave).IsUnique();
            e.Property(x => x.Asunto).HasMaxLength(300).IsRequired();
            e.Property(x => x.Mensaje).HasMaxLength(4000).IsRequired();
            e.Property(x => x.ActualizadoPor).HasMaxLength(150);
        });
    }
}
