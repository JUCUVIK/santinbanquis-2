using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MinimalAPI.Models;

public class Reserva
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string UsuarioId { get; set; } = string.Empty; 

    public string NumeroReserva { get; set; } = string.Empty; 
    public string Estado { get; set; } = string.Empty; 
    public string Centro { get; set; } = string.Empty; 
    public string Fecha { get; set; } = string.Empty; 
    public string Entradas { get; set; } = string.Empty; 
    public double Total { get; set; }
    public string ConsentimientoPdfBase64 { get; set; } = string.Empty;
}