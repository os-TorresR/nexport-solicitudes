namespace Nexport.Solicitudes.Api.Common;

public static class Roles
{
    public const string Cliente = "Cliente";
    public const string Operacion = "Operacion";
    public const string JefeTurno = "JefeTurno";
    public const string Admin = "Admin";

    public static readonly string[] Todos = [Cliente, Operacion, JefeTurno, Admin];

    // Combinaciones para [Authorize(Roles = ...)]
    public const string Personal = Operacion + "," + JefeTurno + "," + Admin;
    public const string Supervisores = JefeTurno + "," + Admin;

    public static bool EsPersonal(string? rol) => rol is Operacion or JefeTurno or Admin;
    public static bool PuedeDarVb(string? rol) => rol is JefeTurno or Admin;
}
