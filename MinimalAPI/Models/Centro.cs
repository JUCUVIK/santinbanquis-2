using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MinimalAPI.Models;

public class Centro
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Ubicacion { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    [BsonIgnoreIfNull]
    public List<string> TarifasIds { get; set; } = new();

    public List<OfertaCentro> Ofertas { get; set; } = new();

    [BsonExtraElements]
    public BsonDocument? AdditionalElements { get; set; }
}

public class OfertaCentro
{
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string ImagenUrl { get; set; } = string.Empty;
    public string EnlaceHref { get; set; } = string.Empty;
}
