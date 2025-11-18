const mongoose = require('mongoose');

// Definición del esquema para la colección 'usuarios'
const usuarioSchema = new mongoose.Schema({
  rut: { 
    type: String, 
    required: true, 
    unique: true 
  },
  nombre: { 
    type: String, 
    required: true 
  },
  apellidos: { 
    type: String, 
    required: true 
  },
  correo: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  // Roles permitidos según instrucciones: Admin, Vendedor, Cliente
  rol: { 
    type: String, 
    enum: ['admin', 'vendedor', 'cliente'], 
    default: 'cliente' 
  },
  region: String,
  comuna: String,
  direccion: String
});

module.exports = mongoose.model('Usuario', usuarioSchema);