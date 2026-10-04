namespace Nexport.Solicitudes.Api.Data.Entities;

/// <summary>Usuario del sistema. Equivale a una @Entity de JPA.</summary>
public class Usuario
{
    public int Id { get; set; }
    public string Nombre { get; set; } = "";
    public string Correo { get; set; } = "";
    public string? Empresa { get; set; }
    public string? Telefono { get; set; }
    public string PasswordHash { get; set; } = "";

    /// <summary>Cliente, Operacion, JefeTurno o Admin (ver <see cref="Common.Roles"/>).</summary>
    public string Rol { get; set; } = Common.Roles.Cliente;

    /// <summary>Pendiente (espera aprobación del admin), Activo o Inactivo.</summary>
    public string Estado { get; set; } = EstadosUsuario.Pendiente;

    public DateTimeOffset CreadoEn { get; set; }
    public DateTimeOffset? UltimoIngreso { get; set; }
}

public static class EstadosUsuario
{
    public const string Pendiente = "Pendiente";
    public const string Activo = "Activo";
    public const string Inactivo = "Inactivo";

    public static readonly string[] Todos = [Pendiente, Activo, Inactivo];
}
