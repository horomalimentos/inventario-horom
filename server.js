const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Conexión a MongoDB
mongoose.connect("mongodb://localhost:27017/usuarios", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ Conectado a MongoDB"))
.catch(err => console.error("❌ Error de conexión a MongoDB:", err));

// Definir esquemas
const usuarioSchema = new mongoose.Schema({
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
});

const usuarioRegistroSchema = new mongoose.Schema({
  usuario: String,
  contraseña: String
});

// Modelos
const Usuario = mongoose.model("Usuario", usuarioSchema);
const UsuarioRegistrado = mongoose.model("UsuarioRegistrado", usuarioRegistroSchema);

// -------------------------------------------------------------
// Rutas para Inventarios
// -------------------------------------------------------------

// Guardar un nuevo inventario
app.post("/guardar-nombre", async (req, res) => {
  try {
    const usuario = new Usuario(req.body);
    await usuario.save();
    res.send(usuario._id); // Devolvemos ID para referencia
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al guardar inventario");
  }
});

// Obtener todos los inventarios
app.get("/nombres", async (req, res) => {
  try {
    const inventarios = await Usuario.find().sort({ creadoEn: -1 });
    res.json(inventarios);
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al obtener inventarios");
  }
});

// Editar inventario completo
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

// Editar solo un artículo del inventario
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

// Eliminar inventario
app.delete("/eliminar-nombre/:id", async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.send("✅ Inventario eliminado correctamente");
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al eliminar inventario");
  }
});

// -------------------------------------------------------------
// Rutas para Usuarios Registrados
// -------------------------------------------------------------

// Obtener lista de usuarios registrados
app.get("/usuarios-registrados", async (req, res) => {
  try {
    const usuarios = await UsuarioRegistrado.find({}, 'usuario');
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al obtener usuarios registrados");
  }
});

// Validar usuario registrado
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

// Agregar nuevo usuario registrado
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

// Modificar contraseña de un usuario
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

// Eliminar un usuario registrado
app.delete("/eliminar-usuario/:id", async (req, res) => {
  try {
    await UsuarioRegistrado.findByIdAndDelete(req.params.id);
    res.send("✅ Usuario eliminado correctamente");
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error al eliminar usuario");
  }
});

// -------------------------------------------------------------

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});

