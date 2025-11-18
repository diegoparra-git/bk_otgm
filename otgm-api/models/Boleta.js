const mongoose = require('mongoose');

// Definición del esquema para la colección 'boletas'
const boletaSchema = new mongoose.Schema({
  fecha: { 
    type: Date, 
    default: Date.now 
  },
  total: { 
    type: Number, 
    required: true 
  },
  estado: { 
    type: String, 
    default: 'Emitida' // Estados: Emitida, Pagada, Despachada
  },
  // Relación con el Usuario (Cliente)
  usuario: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  // Detalle de la compra incrustado (NoSQL way)
  items: [{
    productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
    titulo: String,
    precio: Number,
    cantidad: Number
  }]
});

module.exports = mongoose.model('Boleta', boletaSchema);