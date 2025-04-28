// routes/articulosRoutes.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Articulo = require('../models/Articulo');

// Obtener todos los artículos
router.get('/', async (req, res) => {
  try {
    const articulos = await Articulo.find();
    res.json(articulos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los artículos', error });
  }
});

// Crear un nuevo artículo
router.post('/', async (req, res) => {
  try {
    const { nombre, proveedor, area, precio } = req.body;
    const nuevoArticulo = new Articulo({ nombre, proveedor, area, precio });
    await nuevoArticulo.save();
    res.status(201).json({ mensaje: 'Artículo creado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el artículo', error });
  }
});

// Actualizar un artículo existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, proveedor, area, precio } = req.body;
    await Articulo.findByIdAndUpdate(id, { nombre, proveedor, area, precio });
    res.json({ mensaje: 'Artículo actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el artículo', error });
  }
});

// Eliminar un artículo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Articulo.findByIdAndDelete(id);
    res.json({ mensaje: 'Artículo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el artículo', error });
  }
});

module.exports = router;
