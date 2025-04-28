// models/Articulo.js

const mongoose = require('mongoose');

const articuloSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true 
  },
  proveedor: { 
    type: String, 
    required: true 
  },
  area: { 
    type: String, 
    required: true,
    enum: ['CAJA', 'COCINA', 'SUSHI'] // Restringimos las áreas posibles
  },
  unidad: { 
    type: String, 
    required: true 
  },
  precio: { 
    type: Number, 
    required: true 
  }
}, { timestamps: true }); // Opcional: añade createdAt y updatedAt automáticos

module.exports = mongoose.model('Articulo', articuloSchema);
