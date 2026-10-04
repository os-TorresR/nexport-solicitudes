using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Nexport.Solicitudes.Api.Features.Correo;

public record ResultadoEnvio(bool Ok, bool Simulado, string? Error = null);

public interface IEmailSender
{
    Task<ResultadoEnvio> EnviarAsync(IReadOnlyCollection<string> destinatarios, string asunto, string cuerpo, CancellationToken ct = default);
}

/// <summary>
/// Envía por SMTP con MailKit. Si el correo está deshabilitado, guarda el mensaje como archivo .eml
/// (se abre con Outlook) para poder probar todo sin una cuenta SMTP.
/// </summary>
public class EmailSender(IOptions<CorreoOptions> opciones, IWebHostEnvironment env, ILogger<EmailSender> logger) : IEmailSender
{
    private readonly CorreoOptions _cfg = opciones.Value;

    public async Task<ResultadoEnvio> EnviarAsync(IReadOnlyCollection<string> destinatarios, string asunto, string cuerpo, CancellationToken ct = default)
    {
        if (destinatarios.Count == 0) return new ResultadoEnvio(false, false, "No hay destinatarios configurados.");

        try
        {
            var mensaje = new MimeMessage();
            var remitente = string.IsNullOrWhiteSpace(_cfg.Remitente) ? "no-reply@nexport.local" : _cfg.Remitente;
            mensaje.From.Add(new MailboxAddress(_cfg.NombreRemitente, remitente));
            foreach (var d in destinatarios) mensaje.To.Add(MailboxAddress.Parse(d));
            mensaje.Subject = asunto;
            mensaje.Body = new TextPart("plain") { Text = cuerpo };

            if (!_cfg.Habilitado)
            {
                var carpeta = Path.Combine(env.ContentRootPath, _cfg.CarpetaSimulados);
                Directory.CreateDirectory(carpeta);
                var sufijo = Guid.NewGuid().ToString("N")[..8];
                var archivo = Path.Combine(carpeta, $"{DateTime.Now:yyyyMMdd-HHmmss-fff}-{sufijo}.eml");
                await using (var fs = File.Create(archivo))
                    await mensaje.WriteToAsync(fs, ct);
                logger.LogInformation("Correo simulado para {Destinatarios}: {Asunto} ({Archivo})", string.Join(", ", destinatarios), asunto, archivo);
                return new ResultadoEnvio(true, true);
            }

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_cfg.Host, _cfg.Puerto, _cfg.UsarStartTls ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto, ct);
            if (!string.IsNullOrWhiteSpace(_cfg.Usuario))
                await smtp.AuthenticateAsync(_cfg.Usuario, _cfg.Password, ct);
            await smtp.SendAsync(mensaje, ct);
            await smtp.DisconnectAsync(true, ct);
            return new ResultadoEnvio(true, false);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "No se pudo enviar el correo '{Asunto}'", asunto);
            return new ResultadoEnvio(false, false, ex.Message);
        }
    }
}
