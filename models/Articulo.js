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
    required: true 
  },
  precio: { 
    type: Number, 
    required: true 
  }
});

module.exports = mongoose.model('Articulo', articuloSchema);

