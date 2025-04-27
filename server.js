const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Conexión a MongoDB
mongoose.connect("mongodb+srv://horomalimentos:Pelon93.@cluster0.gizie9z.mongodb.net/inventario", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ Conectado a MongoDB"))
.catch(err => console.error("❌ Error de conexión a MongoDB:", err));

// MODELOS
const Usuario = mongoose.model("Usuario", new mongoose.Schema({
  nombre: String,
  ubicacion: String,
  area: String,
  creadoEn: { type: Date, default: Date.now },
  articulos: Object,
  historial: [{
    usuario: String,
    fecha: { type: Date, default: Date.now },
    accion: String
  }]
}));

const UsuarioRegistrado = mongoose.model("UsuarioRegistrado", new mongoose.Schema({
  usuario: String,
  contraseña: String
}));

const Articulo = mongoose.model("Articulo", new mongoose.Schema({
  nombre: String,
  proveedor: { type: String, default: "Desconocido" },
  unidad: { type: String, default: "Desconocido" },
  costo: { type: Number, default: 0 },
  area: { type: String, default: "Desconocida" },
  historialCostos: [{
    costo: Number,
    fecha: { type: Date, default: Date.now }
  }]
}));

// ==========================
// Rutas para Inventarios
// ==========================
app.post("/guardar-nombre", async (req, res) => {
  try {
    const usuario = new Usuario(req.body);
    await usuario.save();
    res.send(usuario._id);
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al guardar inventario");
  }
});

app.get("/nombres", async (req, res) => {
  try {
    const inventarios = await Usuario.find().sort({ creadoEn: -1 });
    res.json(inventarios);
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al obtener inventarios");
  }
});

app.put("/editar-nombre/:id", async (req, res) => {
  try {
    const { articulos, usuario } = req.body;
    await Usuario.findByIdAndUpdate(req.params.id, {
      articulos,
      $push: { historial: { usuario, accion: 'Modificación Inventario Completo' } }
    });
    res.send("✅ Inventario actualizado correctamente");
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al actualizar inventario");
  }
});

app.put("/editar-articulo/:id", async (req, res) => {
  try {
    const { articulo, cantidad, usuario } = req.body;
    await Usuario.findByIdAndUpdate(req.params.id, {
      $set: { [`articulos.${articulo}`]: cantidad },
      $push: { historial: { usuario, accion: `Modificación Artículo: ${articulo}` } }
    });
    res.send("✅ Artículo actualizado correctamente");
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al actualizar artículo");
  }
});

app.delete("/eliminar-nombre/:id", async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.send("✅ Inventario eliminado correctamente");
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al eliminar inventario");
  }
});

// ==========================
// Rutas para Usuarios
// ==========================
app.get("/usuarios-registrados", async (req, res) => {
  try {
    const usuarios = await UsuarioRegistrado.find({}, 'usuario');
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al obtener usuarios registrados");
  }
});

app.post("/validar-usuario", async (req, res) => {
  try {
    const { usuario, contraseña } = req.body;
    const user = await UsuarioRegistrado.findOne({ usuario, contraseña });
    res.json({ valido: !!user });
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al validar usuario");
  }
});

app.post("/nuevo-usuario", async (req, res) => {
  try {
    const nuevoUsuario = new UsuarioRegistrado(req.body);
    await nuevoUsuario.save();
    res.send("✅ Usuario agregado correctamente");
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al agregar usuario");
  }
});

app.put("/modificar-usuario/:id", async (req, res) => {
  try {
    const { contraseña } = req.body;
    await UsuarioRegistrado.findByIdAndUpdate(req.params.id, { contraseña });
    res.send("✅ Contraseña modificada correctamente");
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al modificar contraseña");
  }
});

app.delete("/eliminar-usuario/:id", async (req, res) => {
  try {
    await UsuarioRegistrado.findByIdAndDelete(req.params.id);
    res.send("✅ Usuario eliminado correctamente");
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al eliminar usuario");
  }
});

// ==========================
// Rutas para Artículos
// ==========================
app.get("/articulos", async (req, res) => {
  try {
    const articulos = await Articulo.find();
    res.json(articulos);
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al obtener artículos");
  }
});

app.post("/nuevo-articulo", async (req, res) => {
  try {
    const { nombre, proveedor, unidad, costo, area } = req.body;
    const articulo = new Articulo({ nombre, proveedor, unidad, costo, area, historialCostos: [{ costo }] });
    await articulo.save();
    res.send("✅ Artículo agregado correctamente");
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al agregar artículo");
  }
});

app.put("/editar-articulo/:id", async (req, res) => {
  try {
    const { costo } = req.body;
    await Articulo.findByIdAndUpdate(req.params.id, {
      $set: { costo },
      $push: { historialCostos: { costo } }
    });
    res.send("✅ Costo actualizado correctamente");
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al actualizar artículo");
  }
});

app.delete("/eliminar-articulo/:id", async (req, res) => {
  try {
    await Articulo.findByIdAndDelete(req.params.id);
    res.send("✅ Artículo eliminado correctamente");
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al eliminar artículo");
  }
});

// ==========================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
