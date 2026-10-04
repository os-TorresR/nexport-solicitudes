namespace Nexport.Solicitudes.Api.Common;

/// <summary>Catálogo CFS IMPO. Debe coincidir con src/data/servicios.js del frontend.</summary>
public static class Catalogo
{
    public static readonly IReadOnlyDictionary<string, string> Servicios = new Dictionary<string, string>
    {
        ["desconsolidacion"] = "Desconsolidación",
        ["carguio"] = "Carguío",
        ["aforo"] = "Aforo",
        ["rancho"] = "Rancho",
        ["varada-desvarada"] = "Varada / Desvarada",
        ["recepcion"] = "Recepción",
        ["porteo"] = "Porteo",
        ["otros"] = "Otros servicios",
    };

    public static readonly string[] Turnos = ["1° Turno", "2° Turno", "3° Turno"];

    public static readonly string[] UnidadesMedida = ["Pza", "Kg", "Ton", "Contenedor", "Camión", "Bulto"];

    public const string SectorPorDefecto = "CFS IMPO";
}
