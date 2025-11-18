const mongoose = require('mongoose');

// Definición del esquema para la colección 'productos'
const productoSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  descripcion: String,
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  stockCritico: { type: Number, default: 5 },
  // Guardamos la categoría como string simple por ahora para facilitar la integración
  categoria: { type: String, required: true }, 
  image: String,
  miniatura1: String,
  miniatura2: String
});

module.exports = mongoose.model('Producto', productoSchema);