const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger_output.json';

// ⚠️ IMPORTANTE: Aquí debes poner el nombre EXACTO de tu archivo principal.
// Si tu archivo se llama "server.js", pon './server.js'.
// Si se llama "index.js", pon './index.js'.
const endpointsFiles = ['./index.js']; 

const doc = {
  info: {
    title: 'On The Go Music API',
    description: 'API REST para gestión de música y ventas',
    version: '1.0.0'
  },
  host: 'localhost:3000',
  schemes: ['http'],
  
  // 🔐 Configuración para que funcione el candado (JWT) en Swagger
  securityDefinitions: {
      bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          scheme: 'bearer',
          in: 'header',
          description: "Ingresa tu token en el formato: Bearer <tu_token_aqui>"
      },
  },
  
  // Estructuras de datos (Schemas)
  definitions: {
    Login: {
      correo: "cliente@email.com",
      password: "password123"
    },
    NuevoUsuario: {
      rut: "12345678-9",
      nombre: "Juan",
      apellidos: "Perez",
      correo: "juan@email.com",
      password: "password123",
      region: "Metropolitana",
      comuna: "Santiago",
      direccion: "Calle Falsa 123"
    },
    NuevoProducto: {
      codigo: "PROD-001",
      title: "Guitarra Eléctrica",
      descripcion: "Guitarra de 6 cuerdas",
      price: 250000,
      stock: 10,
      categoria: "Cuerdas",
      image: "url_imagen"
    },
    NuevaBoleta: {
      usuario: "ID_DEL_USUARIO",
      total: 50000,
      items: [{
        productoId: "ID_PRODUCTO",
        titulo: "Guitarra",
        precio: 50000,
        cantidad: 1
      }]
    }
  }
};

// Generamos el archivo
swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    console.log('✅ Documentación generada con éxito en: ' + outputFile);
    console.log('👉 Ahora asegúrate de que tu archivo principal ("server.js" o "index.js") apunte a este JSON.');
});