using MinimalAPI.Data;
using MinimalAPI.Models;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// Configurar MongoDB a través de nuestra clase de contexto
builder.Services.AddSingleton<MongoDbContext>();

// Añadir soporte para Controladores
builder.Services.AddControllers();

// Habilitar CORS para que tu página web (frontend) pueda comunicarse sin errores de seguridad
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTodo", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Aplicar la política de CORS
app.UseCors("PermitirTodo");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
    if (!db.Tarifas.Find(_ => true).Any())
    {
        var tarifasIniciales = new List<Tarifa>
        {
            new Tarifa { Categoria = "juego", Nombre = "Bebé", Subtitulo = "Hasta 2 años", Precio = 0, SufijoPrecio = "", Nota = "Acompañado de adulto", ImagenUrl = "assets/tarifa_bebe.png" },
            new Tarifa { Categoria = "juego", Nombre = "Infantil", Subtitulo = "3 – 12 años", Precio = 8, SufijoPrecio = " €/hora", Nota = "Calcetines incluidos", ImagenUrl = "assets/tarifa_infantil.png" },
            new Tarifa { Categoria = "juego", Nombre = "Junior/Adulto", Subtitulo = "13+ años", Precio = 10, SufijoPrecio = " €/hora", Nota = "Calcetines incluidos", Destacado = true, EtiquetaDestacado = "⭐ Más popular", ImagenUrl = "assets/tarifa_junior.png" },
            new Tarifa { Categoria = "juego", Nombre = "Familiar", Subtitulo = "2 adultos + 2 niños", Precio = 30, SufijoPrecio = " €/hora", Nota = "Ahorra 6€", ImagenUrl = "assets/tarifa_familiar.png" },
            new Tarifa { Categoria = "cumple", Nombre = "Pack Básico", Subtitulo = "Hasta 10 niños", Precio = 150, SufijoPrecio = " €", Nota = "1h trampolín + sala + tarta", ImagenUrl = "assets/servicio_cumpleanos.png" },
            new Tarifa { Categoria = "cumple", Nombre = "Pack Premium", Subtitulo = "Hasta 15 niños", Precio = 220, SufijoPrecio = " €", Nota = "2h trampolín + sala + catering", Destacado = true, EtiquetaDestacado = "⭐ Recomendado", ImagenUrl = "assets/servicio_fiesta_privada.png" },
            new Tarifa { Categoria = "excursion", Nombre = "Grupo escolar", Subtitulo = "Mínimo 20 alumnos", Precio = 7, SufijoPrecio = " €/niño", Nota = "Monitor incluido", ImagenUrl = "assets/servicio_excursiones.png" },
            new Tarifa { Categoria = "excursion", Nombre = "Grupo premium", Subtitulo = "Mínimo 30 personas", Precio = 9, SufijoPrecio = " €/pers.", Nota = "Monitor + snack", ImagenUrl = "assets/servicio_fiesta_privada.png" }
        };
        db.Tarifas.InsertMany(tarifasIniciales);
    }

    if (!db.Centros.Find(_ => true).Any())
    {
        var centrosIniciales = new List<Centro>
        {
            new Centro
            {
                Nombre = "Saltimbanquis club Barajas",
                Ubicacion = "Calle Campezo, 3 (Local 6) · 28022 San Blas-Canillejas, Madrid",
                Ofertas = new List<OfertaCentro>
                {
                    new OfertaCentro { Titulo = "Cumpleaños", Descripcion = "Paquetes personalizados para celebrar tu día especial con trampolines.", ImagenUrl = "assets/servicio_cumpleanos.png", EnlaceHref = "/barajas/cumpleanos" },
                    new OfertaCentro { Titulo = "Excursiones", Descripcion = "Grupos escolares y organizados con monitor incluido.", ImagenUrl = "assets/servicio_excursiones.png", EnlaceHref = "/barajas/excursiones" },
                    new OfertaCentro { Titulo = "Fiestas privadas", Descripcion = "Alquila el parque completo para tu evento único.", ImagenUrl = "assets/Privada.png", EnlaceHref = "/barajas/fiesta-privada" },
                    new OfertaCentro { Titulo = "Instalaciones", Descripcion = "Amplias zonas de trampolines, foam pit y mucho más.", ImagenUrl = "assets/instalaciones.png", EnlaceHref = "/barajas/instalaciones" }
                }
            },
            new Centro
            {
                Nombre = "Saltimbanquis club Boadilla",
                Ubicacion = "Avenida Siglo XXI, 15 · 28660 Boadilla del Monte, Madrid",
                Ofertas = new List<OfertaCentro>
                {
                    new OfertaCentro { Titulo = "Cumpleaños", Descripcion = "Festeja tu cumpleaños saltando por los aires.", ImagenUrl = "assets/servicio_cumpleanos.png", EnlaceHref = "/boadilla/cumpleanos" },
                    new OfertaCentro { Titulo = "Actividades Infantiles", Descripcion = "Juegos guiados por especialistas en Boadilla.", ImagenUrl = "assets/tarifa_infantil.png", EnlaceHref = "/boadilla/actividades" }
                }
            }
        };
        db.Centros.InsertMany(centrosIniciales);
    }
}

// Mapear los controladores
app.MapControllers();

app.MapGet("/", () => "¡API de Saltimbanquis club funcionando con Controladores y MongoDB!");

// ==== ENDPOINTS DE MINIMAL API P/ ADMIN ====

// -- Tarifas --
var apiTarifas = app.MapGroup("/api/tarifas");
apiTarifas.MapGet("/", async (MongoDbContext db) => await db.Tarifas.Find(_ => true).ToListAsync());
apiTarifas.MapPost("/", async (MongoDbContext db, Tarifa nueva) => { await db.Tarifas.InsertOneAsync(nueva); return Results.Ok(nueva); });
apiTarifas.MapPut("/{id}", async (MongoDbContext db, string id, Tarifa act) => {
    act.Id = id; await db.Tarifas.ReplaceOneAsync(t => t.Id == id, act); return Results.Ok(act);
});
apiTarifas.MapDelete("/{id}", async (MongoDbContext db, string id) => {
    await db.Tarifas.DeleteOneAsync(t => t.Id == id); return Results.Ok();
});

// -- Clientes (Users) --
app.MapDelete("/api/users/{id}", async (MongoDbContext db, string id) => {
    await db.Users.DeleteOneAsync(u => u.Id == id); return Results.Ok();
});

// -- Centros --
var apiCentros = app.MapGroup("/api/centros");
apiCentros.MapGet("/", async (MongoDbContext db) => {
    var centros = await db.Centros.Find(_ => true).ToListAsync();
    foreach (var c in centros) { c.AdditionalElements = null; }
    return Results.Ok(centros);
});
apiCentros.MapPost("/", async (MongoDbContext db, Centro nuevo) => { await db.Centros.InsertOneAsync(nuevo); return Results.Ok(nuevo); });
apiCentros.MapPut("/{id}", async (MongoDbContext db, string id, Centro act) => {
    act.Id = id; await db.Centros.ReplaceOneAsync(c => c.Id == id, act); return Results.Ok(act);
});
apiCentros.MapDelete("/{id}", async (MongoDbContext db, string id) => {
    await db.Centros.DeleteOneAsync(c => c.Id == id); return Results.Ok();
});

// -- Reservas handled by ReservasController --

// -- Contacto --
app.MapPost("/api/contacto", async (ContactoDto req, IConfiguration config) => {
    try
    {
        var smtpSettings = config.GetSection("SmtpSettings");
        var mailMessage = new MimeKit.MimeMessage();
        mailMessage.From.Add(new MimeKit.MailboxAddress(smtpSettings["SenderName"], smtpSettings["SenderEmail"]));
        mailMessage.To.Add(new MimeKit.MailboxAddress("Empresa", "info@saltimbanquisclub.com")); // Pon aquí el correo real de la empresa
        mailMessage.Subject = $"Nuevo mensaje de contacto de: {req.Nombre}";

        mailMessage.Body = new MimeKit.TextPart("plain")
        {
            Text = $"Has recibido un nuevo mensaje de contacto.\n\nNombre: {req.Nombre}\nEmail: {req.Email}\nCentro: {req.CentroId}\n\nMensaje:\n{req.Mensaje}"
        };

        using var smtpClient = new MailKit.Net.Smtp.SmtpClient();
        await smtpClient.ConnectAsync(smtpSettings["Server"], int.Parse(smtpSettings["Port"]!), MailKit.Security.SecureSocketOptions.StartTls);
        await smtpClient.AuthenticateAsync(smtpSettings["Username"], smtpSettings["Password"]);
        await smtpClient.SendAsync(mailMessage);
        await smtpClient.DisconnectAsync(true);

        return Results.Ok(new { message = "Mensaje enviado correctamente a la empresa." });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error enviando correo: {ex.Message}");
        return Results.Problem("Ocurrió un error al enviar el mensaje de contacto.");
    }
});

app.Run();

public class ContactoDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string CentroId { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
}
