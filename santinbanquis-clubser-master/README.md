Documentación saltimbanquis CLUB 
(Sergio Cuadrado Hernandez)

-----Índice
Descripción General
Arquitectura y Tecnologías
1. Backend: API REST (.NET 10)
1.1. Modelos de Datos Principales
1.2. Core Endpoints
2. Frontend Web Principal (Angular 18)
3. Frontend de Administración (Angular 18)
Seguridad y Flujo
Configuración y Entornos
Despliegue (Local y Producción)
Despliegue Local
Despliegue a Producción
Calidad y Próximos Pasos (Roadmap)
Descripción General

El proyecto "Saltimbanquis Club" es un sistema integral para gestionar las actividades, tarifas, centros y reservas de un parque de trampolines (indoor) orientado a familias. Este sistema consta de una API Backend desarrollada en .NET con C# y dos aplicaciones de Cliente (Frontend) en Angular, una destinada a la interacción con los usuarios finales y otra enfocada en la administración.

Arquitectura y Tecnologías

La plataforma sigue una arquitectura cliente-servidor distribuida:1. Backend: API REST (.NET 10)

Ubicación: /MinimalAPI
Framework: .NET 10 usando la estructura "Minimal API", hibridada con Contoladores para mayor organización.
Base de Datos: MongoDB.
Librerías principales:
MongoDB.Driver (Para comunicación con la base de datos).
MailKit y MimeKit (Para envío de correos mediante SMTP).



1.1. Modelos de Datos Principales
Centro: Representa un parque físico. Campos: Id (string), Nombre (string), Ubicacion (string), Telefono (string), Email (string), Descripcion (string), Ofertas (List).
Tarifa: Diferentes pases o servicios. Campos: Id (string), Categoria (string), Nombre (string), Subtitulo (string), Precio (decimal), SufijoPrecio (string), Nota (string), Destacado (boolean).
Usuario: Cliente registrado. Campos: Id (string), GoogleId (string), Email (string), Nombre (string), FotoUrl (string).
Reserva: Compra de un usuario. Campos: Id (string), UsuarioId (string), CentroId (string), FechaReserva (DateTime), TarifasSeleccionadas (List), Total (decimal).
1.2. Core Endpoints
Tarifas (/api/tarifas)
GET /: Devuelve todas las tarifas (200 OK).
POST /: Crea una nueva tarifa. Payload: Objeto Tarifa. (200 OK).
PUT /{id}: Actualiza una tarifa. Payload: Objeto Tarifa. (200 OK).
DELETE /{id}: Elimina una tarifa (200 OK).
Centros (/api/centros)
Mismos métodos CRUD, devolviendo objetos Centro sin serializar metadata interna de BSON.
Reservas (/api/reservas)
GET /{usuarioId}: Devuelve historial de reservas de un usuario.
POST /: Registra una nueva venta/reserva. Payload: Objeto Reserva.
Contacto (/api/contacto)
POST /: Recibe ContactoDto (Nombre, Email, CentroId, Mensaje) y remite por MailKit. Retorna 200 OK o 500 Problem.
2. Frontend Web Principal (Angular 18)

Ubicación: /hop-galaxy-web
Framework: Angular 18 (Standalone Components).
Funcionalidad: Muestra el catálogo de servicios (cumpleaños, clases, familiar) pre-renderizando en portada ofertas en tiempo real. Redirige a rutas dinámicas, cuenta con Auth Guard y se adapta nativamente a dispositivos móviles.
Autenticación: Integra con el SDK GSI de Google (accounts.google.com/gsi/client).
Diseño: Basado en Variables de CSS puras (var(--primary)). Posee utilidades responsive modernas como clamp() para fluidez tipográfica y menús móviles de tipo Hamburger.



3. Frontend de Administración (Angular 18)

Ubicación: /hop-galaxy-admin
Framework: Angular 18.
Funcionalidad: Dashboard para control interno. Permite modificar tarifas directamente, reestructurar atributos en los "Centros" (nombre, teléfonos, descripciones y las sub-rutas vinculadas de actividades).
Seguridad y Flujo
Google Auth SSO: Relevando a Google del proceso de manejar contraseñas, al loguearse, el frontend captura un credential (JWT) de cuenta validado por Google. Luego se envía al Backend (/api/login/google) donde se valida la firma, y si es correcto, el backend devuelve el objeto Usuario sincronizado con MongoDB.
CORS policies: El servidor está condicionado para recibir conexiones directas sin intermediarios entre el Web Angular y el API .NET con una política PermitirTodo en el entorno de desarrollo.
Reserva Protegida (Auth Guard): En el componente de compra / reserva (ReservaComponent) los usuarios sin objeto Auth persistido en su caché del navegador (localStorage/sessionStorage o Signal) son derivados forzosamente al login.
Configuración y Entornos

El archivo appsettings.json en MinimalAPI debe incluir:
{
  "ConnectionStrings": {
    "MongoDb": "mongodb://localhost:27017"
  },
  "DatabaseName": "SaltimbanquisDb",
  "SmtpSettings": {
    "Server": "smtp.tuserver.com",
    "Port": 587,
    "SenderName": "Saltimbanquis Web",
    "SenderEmail": "no-reply@saltimbanquis.com",
    "Username": "tu_usuario",
    "Password": "tu_password"
  }
}




Despliegue (Local y Producción)

Despliegue Local
API (.NET):
cd MinimalAPI -> dotnet build -> dotnet run (Suele correr en http://localhost:5000)
Web Frontend (Angular):
cd hop-galaxy-web -> npm install -> npm run start (Puerto habitual :4200)
Admin Frontend (Angular):
cd hop-galaxy-admin -> npm install -> npm run start -- --port 4201
Despliegue a Producción
Frontend: Generar los estáticos compilados y minificados.
ng build --configuration production
El output generado en /dist/ puede ser servido por Nginx, Vercel, Firebase Hosting o IIS.
Backend: Publicar los binarios optimizados.
dotnet publish -c Release -o ./publish
La carpeta publish se puede desplegar en Azure App Service, un contenedor Docker, o un servidor Linux con Kestrel.
Calidad y Próximos Pasos (Roadmap)
Roadmap:
Integración de pasarela de pago (Stripe/Redsys) en el módulo de Reservas.
Generación de Tickets QR en PDF tras reserva exitosa.
Implementación de roles de RBAC (Role-Based Access Control) para el panel de Admin.


