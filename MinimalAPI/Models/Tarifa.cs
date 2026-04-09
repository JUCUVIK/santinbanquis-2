using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MinimalAPI.Models;

public class Tarifa
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public string Categoria { get; set; } = string.Empty; // juego, cumple, excursion
    public string Nombre { get; set; } = string.Empty;
    public string Subtitulo { get; set; } = string.Empty;
    public double Precio { get; set; }
    public string SufijoPrecio { get; set; } = string.Empty;
    public string Nota { get; set; } = string.Empty;
    public bool Destacado { get; set; }
    public string EtiquetaDestacado { get; set; } = string.Empty;
    public string ImagenUrl { get; set; } = string.Empty;
}
