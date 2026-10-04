using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Nexport.Solicitudes.Api.Common;
using Nexport.Solicitudes.Api.Data;
using Nexport.Solicitudes.Api.Data.Entities;
using Nexport.Solicitudes.Api.Features.Auth;
using Nexport.Solicitudes.Api.Features.Correo;
using Nexport.Solicitudes.Api.Features.Plantillas;
using Nexport.Solicitudes.Api.Features.Solicitudes;
using Nexport.Solicitudes.Api.Features.Usuarios;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

// ---------- Base de datos (SQL Server con Entity Framework Core)
builder.Services.AddDbContext<NexportDbContext>(o =>
    o.UseSqlServer(config.GetConnectionString("Nexport")));

// ---------- Servicios de negocio (equivalen a los @Service de Spring)
builder.Services.AddSingleton<Reloj>();
builder.Services.Configure<CorreoOptions>(config.GetSection("Correo"));
builder.Services.AddScoped<IEmailSender, EmailSender>();
builder.Services.AddScoped<NotificacionesService>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<PlantillasService>();
builder.Services.AddScoped<SolicitudesService>();
builder.Services.AddScoped<UsuariosService>();

// ---------- Autenticación con JWT (equivale a Spring Security + filtro JWT)
// Se valida al arrancar: sin una clave de 32+ caracteres la API no inicia (mejor que fallar en cada petición).
var claveJwt = TokenService.Clave(config);
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.MapInboundClaims = false; // conserva los nombres "sub", "name", "role"
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = config["Jwt:Emisor"],
            ValidateAudience = true,
            ValidAudience = config["Jwt:Audiencia"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = claveJwt,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
            NameClaimType = "name",
            RoleClaimType = "role",
        };
        // En cada petición se confirma que el usuario sigue activo y con el mismo rol:
        // si el admin lo desactiva o le cambia el rol, el token deja de servir de inmediato.
        o.Events = new JwtBearerEvents
        {
            OnTokenValidated = async ctx =>
            {
                var db = ctx.HttpContext.RequestServices.GetRequiredService<NexportDbContext>();
                var sub = ctx.Principal?.FindFirstValue("sub");
                var usuario = int.TryParse(sub, out var id)
                    ? await db.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id)
                    : null;
                if (usuario is null || usuario.Estado != EstadosUsuario.Activo || usuario.Rol != ctx.Principal?.FindFirstValue("role"))
                    ctx.Fail("Sesión no válida.");
            },
        };
    });
builder.Services.AddAuthorization();

// ---------- CORS: permite que el frontend (Vite) llame a la API
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
    .WithOrigins(config.GetSection("Cors:Origenes").Get<string[]>() ?? ["http://localhost:5173"])
    .AllowAnyHeader()
    .AllowAnyMethod()));

builder.Services.AddControllers().ConfigureApiBehaviorOptions(o =>
    // Errores de formato en el JSON (ej. un número inválido) con la misma forma { message, campos }.
    o.InvalidModelStateResponseFactory = ctx => new BadRequestObjectResult(new
    {
        message = "Revisa los campos marcados.",
        campos = ctx.ModelState
            .Where(e => e.Value is { Errors.Count: > 0 } && e.Key != "req")
            .GroupBy(e => JsonNamingPolicy.CamelCase.ConvertName(e.Key.TrimStart('$', '.').Split('.', '[')[0]))
            .ToDictionary(g => g.Key, g => "Valor no válido."),
    }));
builder.Services.AddExceptionHandler<ManejadorErrores>();
builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

await DbInicializador.InicializarAsync(app.Services);

app.UseExceptionHandler();
// 401 / 403 del middleware de autenticación también responden { message }.
app.UseStatusCodePages(async ctx =>
{
    var http = ctx.HttpContext;
    if (http.Response.HasStarted || http.Response.ContentLength > 0) return;
    var mensaje = http.Response.StatusCode switch
    {
        StatusCodes.Status401Unauthorized => "Tu sesión no es válida o expiró. Ingresa nuevamente.",
        StatusCodes.Status403Forbidden => "No tienes permiso para realizar esta acción.",
        StatusCodes.Status404NotFound => "Recurso no encontrado.",
        _ => null,
    };
    if (mensaje is not null) await http.Response.WriteAsJsonAsync(new { message = mensaje, campos = new Dictionary<string, string>() });
});
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
