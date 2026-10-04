namespace Nexport.Solicitudes.Api.Common;

/// <summary>
/// Error de negocio con código HTTP y, opcionalmente, errores por campo
/// (los nombres coinciden con los campos del formulario del frontend).
/// </summary>
public class ApiException(int status, string mensaje, IDictionary<string, string>? campos = null) : Exception(mensaje)
{
    public int Status { get; } = status;
    public IDictionary<string, string>? Campos { get; } = campos;

    public static ApiException Validacion(IDictionary<string, string> campos, string mensaje = "Revisa los campos marcados.")
        => new(StatusCodes.Status400BadRequest, mensaje, campos);

    public static ApiException NoEncontrado(string mensaje) => new(StatusCodes.Status404NotFound, mensaje);
    public static ApiException Conflicto(string mensaje) => new(StatusCodes.Status409Conflict, mensaje);
    public static ApiException Prohibido(string mensaje) => new(StatusCodes.Status403Forbidden, mensaje);
}
