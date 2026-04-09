using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MinimalAPI.Data;
using MinimalAPI.Models;
using System.Text.Json;

namespace MinimalAPI.Controllers;

[ApiController]
[Route("api/reservas")]
public class ReservasController : ControllerBase
{
    private readonly MongoDbContext _context;

    public ReservasController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllReservas()
    {
        var reservations = await _context.Reservas.Find(_ => true).ToListAsync();
        return Ok(reservations);
    }

    [HttpGet("{usuarioId}")]
    public async Task<IActionResult> GetUserReservas(string usuarioId)
    {
        var decodedId = System.Net.WebUtility.UrlDecode(usuarioId);
        var reservations = await _context.Reservas.Find(r => r.UsuarioId == decodedId || r.UsuarioId == usuarioId).ToListAsync();
        return Ok(reservations);
    }

    [HttpPost]
    public async Task<IActionResult> CreateReserva([FromBody] Reserva reserva)
    {
        reserva.NumeroReserva = new Random().Next(10000, 99999).ToString();
        reserva.Estado = "PRÓXIMA"; 

        if (string.IsNullOrEmpty(reserva.UsuarioId)) 
        {
            reserva.UsuarioId = "invitado@hopgalaxy.com";
        }

        await _context.Reservas.InsertOneAsync(reserva);
        return Created($"/api/reservas/{reserva.Id}", new { error = false, message = "Reserva creada con éxito.", reserva });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReserva(string id)
    {
        await _context.Reservas.DeleteOneAsync(r => r.Id == id);
        return Ok();
    }
}