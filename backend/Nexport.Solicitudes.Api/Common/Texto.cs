using System.Net.Mail;
using System.Text.RegularExpressions;

namespace Nexport.Solicitudes.Api.Common;

public static partial class Texto
{
    /// <summary>Recorta espacios; devuelve null si queda vacío.</summary>
    public static string? Limpio(string? valor) => string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();

    public static string Requerido(string? valor) => valor?.Trim() ?? "";

    public static bool EsCorreo(string? valor)
    {
        if (string.IsNullOrWhiteSpace(valor)) return false;
        return MailAddress.TryCreate(valor.Trim(), out var dir) && dir.Address == valor.Trim() && valor.Contains('.');
    }

    /// <summary>Agrega un error si el texto supera el largo de la columna en la base de datos.</summary>
    public static void Largo(IDictionary<string, string> campos, string campo, string? valor, int max)
    {
        if (valor is not null && valor.Trim().Length > max && !campos.ContainsKey(campo))
            campos[campo] = $"Máximo {max} caracteres.";
    }

    /// <summary>Reemplaza {variable} por su valor; las desconocidas quedan tal cual.</summary>
    public static string Render(string plantilla, IReadOnlyDictionary<string, string> variables)
        => Variable().Replace(plantilla, m => variables.TryGetValue(m.Groups[1].Value, out var v) ? v : m.Value);

    [GeneratedRegex(@"\{(\w+)\}")]
    private static partial Regex Variable();
}
