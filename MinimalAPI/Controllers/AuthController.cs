using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using MongoDB.Driver;
using MinimalAPI.Data;
using MinimalAPI.Models;

namespace MinimalAPI.Controllers;

[ApiController]
[Route("api")]
public class AuthController : ControllerBase
{
    private readonly MongoDbContext _context;

    public AuthController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] User user)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(user.Email) || string.IsNullOrWhiteSpace(user.Password))
                return BadRequest(new { error = true, message = "El Email y la Contraseña son obligatorios." });

            var existingUser = await _context.Users.Find(u => u.Email == user.Email).FirstOrDefaultAsync();
            if (existingUser != null)
                return BadRequest(new { error = true, message = "El email ya está registrado." });

            var hasher = new PasswordHasher<User>();
            user.Password = hasher.HashPassword(user, user.Password);

            await _context.Users.InsertOneAsync(user);

            return Created($"/api/users/{user.Id}", new { error = false, message = "Cuenta creada con éxito.", userId = user.Id });
        }
        catch (Exception ex)
        {
            return Problem(ex.Message);
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest login)
    {
        try 
        {
            if (string.IsNullOrWhiteSpace(login.Email) || string.IsNullOrWhiteSpace(login.Password))
                return BadRequest(new { error = true, message = "Debes enviar el Email y la Contraseña." });

            var user = await _context.Users.Find(u => u.Email == login.Email).FirstOrDefaultAsync();

            if (user is null)
                return Unauthorized(new { error = true, message = "Email o contraseña incorrectos." });

            var hasher = new PasswordHasher<User>();
            var verifyResult = hasher.VerifyHashedPassword(user, user.Password, login.Password);

            if (verifyResult == PasswordVerificationResult.Failed)
                return Unauthorized(new { error = true, message = "Email o contraseña incorrectos." });

            return Ok(new { error = false, message = "Inicio de sesión exitoso.", id = user.Id, nombre = user.Nombre, email = user.Email });
        }
        catch (Exception ex)
        {
            return Problem(ex.Message);
        }
    }

    [HttpPost("login/google")]
    public async Task<IActionResult> LoginGoogle([FromBody] GoogleLoginRequest req)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(req.Email))
                return BadRequest(new { error = true, message = "Falta el email en el token de Google." });

            var user = await _context.Users.Find(u => u.Email == req.Email).FirstOrDefaultAsync();

            if (user == null)
            {
                // Si no existe, lo creamos
                user = new User
                {
                    Email = req.Email,
                    Nombre = req.Nombre,
                    Apellidos = req.Apellidos,
                    Password = "", // Sin contraseña por defecto
                    CentroFavorito = "" // Puede configurarlo después
                };
                await _context.Users.InsertOneAsync(user);
            }

            return Ok(new { error = false, message = "Inicio de sesión exitoso con Google.", id = user.Id, nombre = user.Nombre, user = user });
        }
        catch (Exception ex)
        {
            return Problem(ex.Message);
        }
    }
}

public class GoogleLoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string GoogleId { get; set; } = string.Empty;
}