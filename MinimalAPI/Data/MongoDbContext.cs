using MinimalAPI.Models;
using MongoDB.Driver;

namespace MinimalAPI.Data;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("MongoDb");
        var client = new MongoClient(connectionString);
        _database = client.GetDatabase("santimbanqui");
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("clientes");
    public IMongoCollection<Reserva> Reservas => _database.GetCollection<Reserva>("reservas");
    public IMongoCollection<Tarifa> Tarifas => _database.GetCollection<Tarifa>("tarifas");
    public IMongoCollection<Centro> Centros => _database.GetCollection<Centro>("centros");
}