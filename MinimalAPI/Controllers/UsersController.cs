using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MinimalAPI.Data;
using MinimalAPI.Models;

namespace MinimalAPI.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly MongoDbContext _context;

    public UsersController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var allUsers = await _context.Users.Find(_ => true).ToListAsync();
        return Ok(allUsers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        var user = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
        return user is not null ? Ok(user) : NotFound();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] User updatedProfile)
    {
        var user = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
        if (user is null) return NotFound();

        // Actualizamos solo los datos permitidos
        user.Nombre = updatedProfile.Nombre;
        user.Apellidos = updatedProfile.Apellidos;
        user.Email = updatedProfile.Email;
        user.Telefono = updatedProfile.Telefono;
        user.CentroFavorito = updatedProfile.CentroFavorito;

        await _context.Users.ReplaceOneAsync(u => u.Id == id, user);

        return Ok(new { error = false, message = "Perfil actualizado con éxito.", user });
    }
    
    [HttpGet("{id}/reservas")]
    public async Task<IActionResult> GetUserReservas(string id)
    {
        var reservas = await _context.Reservas.Find(r => r.UsuarioId == id).ToListAsync();
        return Ok(reservas);
    }
}