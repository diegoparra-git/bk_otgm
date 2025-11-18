const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Importar Modelos
const Producto = require('./models/Producto');
const Usuario = require('./models/Usuario');
const Boleta = require('./models/Boleta');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const MONGO_URI = 'mongodb://127.0.0.1:27017/onthegomusic';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error MongoDB:', err));

// --- LOGIN & REGISTER ---
app.post('/login', async (req, res) => {
  const { correo, password } = req.body;
  try {
    const user = await Usuario.findOne({ correo, password });
    if (user) {
      const { password, ...userWithoutPass } = user.toObject();
      res.json(userWithoutPass);
    } else {
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error servidor' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const nuevoUsuario = new Usuario({ ...req.body, rol: 'cliente' });
    await nuevoUsuario.save();
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(400).json({ message: 'Error registro', error });
  }
});

// --- PRODUCTOS ---
app.get('/productos', async (req, res) => {
  const productos = await Producto.find();
  res.json(productos);
});

app.get('/productos/:id', async (req, res) => {
  const producto = await Producto.findById(req.params.id);
  producto ? res.json(producto) : res.status(404).json({ message: 'No encontrado' });
});

app.post('/productos', async (req, res) => {
  try {
    const producto = new Producto(req.body);
    await producto.save();
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/productos/:id', async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(producto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/productos/:id', async (req, res) => {
  await Producto.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// --- USUARIOS ---
app.get('/usuarios', async (req, res) => {
  const usuarios = await Usuario.find();
  res.json(usuarios);
});

app.post('/usuarios', async (req, res) => {
  try {
    const usuario = new Usuario(req.body);
    await usuario.save();
    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- BOLETAS ---
app.get('/boletas', async (req, res) => {
  try {
    // .populate('usuario') rellena los datos del usuario en lugar de mostrar solo el ID
    const boletas = await Boleta.find().populate('usuario'); 
    res.json(boletas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/boletas', async (req, res) => {
  try {
    const boleta = new Boleta(req.body);
    await boleta.save();
    res.status(201).json(boleta);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API corriendo en puerto ${PORT}`);
});