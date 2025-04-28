const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URL, {
  dbName: "usuarios",
}).then(() => console.log("✅ Conectado a MongoDB"))
.catch(err => console.error("❌ Error de conexión a MongoDB:", err));

// ✨ Ruta principal para verificar funcionamiento
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente ✅");
});

// Esquemas y Modelos
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

const configuracionSchema = new mongoose.Schema({
  ajusteHora: { type: Number, default: 0 }
});

const Usuario = mongoose.model("Usuario", usuarioSchema);
const UsuarioRegistrado = mongoose.model("UsuarioRegistrado", usuarioRegistroSchema);
const Configuracion = mongoose.model("Configuracion", configuracionSchema);

// Endpoints principales

app.get("/usuarios-registrados", async (req, res) => {
  const usuarios = await UsuarioRegistrado.find({}, 'usuario');
  res.json(usuarios);
});

app.post("/nuevo-usuario", async (req, res) => {
  const nuevoUsuario = new UsuarioRegistrado(req.body);
  await nuevoUsuario.save();
  res.send("✅ Usuario agregado");
});

app.post("/validar-usuario", async (req, res) => {
  const { usuario, contraseña } = req.body;
  const user = await UsuarioRegistrado.findOne({ usuario, contraseña });
  res.json({ valido: !!user });
});

app.put("/modificar-usuario/:id", async (req, res) => {
  const { contraseña } = req.body;
  await UsuarioRegistrado.findByIdAndUpdate(req.params.id, { contraseña });
  res.send("✅ Contraseña modificada");
});

app.delete("/eliminar-usuario/:id", async (req, res) => {
  await UsuarioRegistrado.findByIdAndDelete(req.params.id);
  res.send("✅ Usuario eliminado");
});

app.post("/guardar-nombre", async (req, res) => {
  const usuario = new Usuario(req.body);
  await usuario.save();
  res.send(usuario._id);
});

app.get("/nombres", async (req, res) => {
  const inventarios = await Usuario.find().sort({ creadoEn: -1 });
  res.json(inventarios);
});

app.put("/editar-nombre/:id", async (req, res) => {
  const { articulos, usuario } = req.body;
  await Usuario.findByIdAndUpdate(req.params.id, {
    articulos,
    $push: { historial: { usuario, accion: "Modificación Inventario Completo" } }
  });
  res.send("✅ Inventario actualizado");
});

app.put("/editar-articulo/:id", async (req, res) => {
  const { articulo, cantidad, usuario } = req.body;
  await Usuario.findByIdAndUpdate(req.params.id, {
    $set: { [`articulos.${articulo}`]: cantidad },
    $push: { historial: { usuario, accion: `Modificación Artículo: ${articulo}` } }
  });
  res.send("✅ Artículo actualizado");
});

app.delete("/eliminar-nombre/:id", async (req, res) => {
  await Usuario.findByIdAndDelete(req.params.id);
  res.send("✅ Inventario eliminado");
});

// Configuración Horario
app.get("/configuracion", async (req, res) => {
  const config = await Configuracion.findOne();
  res.json(config || { ajusteHora: 0 });
});

app.put("/configuracion", async (req, res) => {
  const { ajusteHora } = req.body;
  let config = await Configuracion.findOne();
  if (!config) config = new Configuracion();
  config.ajusteHora = ajusteHora;
  await config.save();
  res.send("✅ Configuración actualizada");
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
