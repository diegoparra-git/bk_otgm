const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger_output.json';
// ERROR ORIGINAL: const endpointsFiles = ['./routes/*.js'];
// CORRECCIÓN: Apunta a tu archivo principal donde están las rutas
const endpointsFiles = ['./index.js']; 

const doc = {
  info: {
    title: 'On The Go Music API',
    description: 'API REST para gestión de música y ventas',
    version: '1.0.0'
  },
  host: 'localhost:3000',
  schemes: ['http'],
  // Definimos las estructuras de datos para usarlas en la documentación
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

swaggerAutogen(outputFile, endpointsFiles, doc);