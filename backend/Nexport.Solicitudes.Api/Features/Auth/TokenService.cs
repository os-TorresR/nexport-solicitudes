using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Nexport.Solicitudes.Api.Data.Entities;

namespace Nexport.Solicitudes.Api.Features.Auth;

/// <summary>Emite el JWT con id, nombre, correo y rol del usuario.</summary>
public class TokenService(IConfiguration config)
{
    public static SymmetricSecurityKey Clave(IConfiguration config)
    {
        var clave = config["Jwt:Clave"];
        if (string.IsNullOrWhiteSpace(clave) || clave.Length < 32)
            throw new InvalidOperationException("Configura Jwt:Clave con al menos 32 caracteres (appsettings o variable de entorno Jwt__Clave).");
        return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(clave));
    }

    public (string Token, DateTimeOffset Expira) Crear(Usuario u)
    {
        var expira = DateTimeOffset.UtcNow.AddHours(config.GetValue("Jwt:HorasValidez", 8));
        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = config["Jwt:Emisor"],
            Audience = config["Jwt:Audiencia"],
            Expires = expira.UtcDateTime,
            SigningCredentials = new SigningCredentials(Clave(config), SecurityAlgorithms.HmacSha256),
            Subject = new ClaimsIdentity(
            [
                new Claim("sub", u.Id.ToString()),
                new Claim("name", u.Nombre),
                new Claim("email", u.Correo),
                new Claim("role", u.Rol),
            ]),
        };
        return (new JsonWebTokenHandler().CreateToken(descriptor), expira);
    }
}
