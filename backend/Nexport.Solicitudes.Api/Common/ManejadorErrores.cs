using Microsoft.AspNetCore.Diagnostics;

namespace Nexport.Solicitudes.Api.Common;

/// <summary>
/// Convierte las excepciones en JSON { message, campos } (como un @ControllerAdvice de Spring).
/// </summary>
public class ManejadorErrores(ILogger<ManejadorErrores> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext http, Exception exception, CancellationToken ct)
    {
        int status;
        object cuerpo;

        if (exception is ApiException api)
        {
            status = api.Status;
            cuerpo = new { message = api.Message, campos = api.Campos ?? new Dictionary<string, string>() };
        }
        else
        {
            logger.LogError(exception, "Error no controlado en {Ruta}", http.Request.Path);
            status = StatusCodes.Status500InternalServerError;
            cuerpo = new { message = "Ocurrió un error inesperado. Intenta nuevamente." };
        }

        http.Response.StatusCode = status;
        await http.Response.WriteAsJsonAsync(cuerpo, ct);
        return true;
    }
}
