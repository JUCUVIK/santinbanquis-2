using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MinimalAPI.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string FechaNacimiento { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string CentroFavorito { get; set; } = string.Empty;
}