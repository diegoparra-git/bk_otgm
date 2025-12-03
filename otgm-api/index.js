const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger_output.json');
const jwt = require('jsonwebtoken');

// Importar Modelos
const Producto = require('./models/Producto');
const Usuario = require('./models/Usuario');
const Boleta = require('./models/Boleta');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'mi_super_secreto_chileno'; 

app.use(express.json());
app.use(cors());

// ==========================================
// 🛡️ MIDDLEWARES
// ==========================================
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const token = bearer[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Token inválido' });
      req.user = decoded.user;
      next();
    });
  } else {
    res.status(401).json({ message: 'Falta Token' });
  }
};

const authorize = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'No autenticado' });
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ message: 'Rol no autorizado' });
    }
    next();
  };
};

// Conexión MongoDB
const MONGO_URI = 'mongodb://127.0.0.1:27017/onthegomusic';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error MongoDB:', err));

// ==========================================
// RUTAS DE AUTENTICACIÓN (DEBUG MEJORADO)
// ==========================================

app.post('/login', async (req, res) => {
  const { correo, password } = req.body;
  
  // 🔍 LOG PARA DEBUG: Mira esto en tu terminal de Node
  console.log(`📡 Intento de Login -> Correo: "${correo}", Pass: "${password}"`);

  try {
    // 1. Buscamos el usuario (ignorando mayúsculas/minúsculas en el correo)
    const user = await Usuario.findOne({ 
        correo: { $regex: new RegExp(`^${correo}$`, 'i') } 
    });

    if (!user) {
        console.log('❌ Usuario no encontrado en la BD');
        return res.status(401).json({ message: 'Usuario no existe' });
    }

    // 2. Verificamos contraseña (comparación simple de texto plano por ahora)
    if (user.password !== password) {
        console.log(`❌ Contraseña incorrecta. BD: "${user.password}" vs Recibido: "${password}"`);
        return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // 3. Login Exitoso
    console.log(`✅ Login exitoso para: ${user.nombre} (${user.rol})`);
    const { password: _, ...userWithoutPass } = user.toObject();
    const token = jwt.sign({ user: userWithoutPass }, SECRET_KEY, { expiresIn: '4h' });
    
    res.json({ user: userWithoutPass, token });

  } catch (error) {
    console.error('🔥 Error en servidor:', error);
    res.status(500).json({ message: 'Error servidor' });
  }
});

// REGISTRO DE USUARIOS (Público)
app.post('/register', async (req, res) => {
  try {
    // Forzamos rol cliente
    const nuevoUsuario = new Usuario({ ...req.body, rol: 'cliente' });
    await nuevoUsuario.save();
    console.log('✅ Usuario registrado:', nuevoUsuario.correo);
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error('Error registro:', error);
    res.status(400).json({ message: 'Error registro', error });
  }
});

// CREAR USUARIO (Ruta usada por tu ViewModel addUser)
app.post('/usuarios', async (req, res) => {
    try {
      const usuario = new Usuario(req.body);
      await usuario.save();
      console.log('✅ Usuario creado vía /usuarios:', usuario.correo);
      res.status(201).json(usuario);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
});

// ==========================================
// RESTO DE RUTAS (Productos, Usuarios, Boletas)
// ==========================================

// PRODUCTOS
app.get('/productos', async (req, res) => {
  const productos = await Producto.find();
  res.json(productos);
});
app.get('/productos/:id', async (req, res) => {
    try {
        const p = await Producto.findById(req.params.id);
        p ? res.json(p) : res.status(404).json({message: 'No encontrado'});
    } catch(e) { res.status(500).json({message: e.message}); }
});
app.post('/productos', verifyToken, authorize(['admin', 'vendedor']), async (req, res) => {
    try {
        const p = new Producto(req.body);
        await p.save();
        res.status(201).json(p);
    } catch(e) { res.status(400).json({message: e.message}); }
});
app.put('/productos/:id', verifyToken, authorize(['admin', 'vendedor']), async (req, res) => {
    await Producto.findByIdAndUpdate(req.params.id, req.body);
    res.json({message: "Actualizado"});
});
app.delete('/productos/:id', verifyToken, authorize(['admin', 'vendedor']), async (req, res) => {
    await Producto.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

// USUARIOS (Admin)
app.get('/usuarios', verifyToken, authorize(['admin']), async (req, res) => {
  const usuarios = await Usuario.find();
  res.json(usuarios);
});
app.put('/usuarios/:id', verifyToken, authorize(['admin']), async (req, res) => {
    const u = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(u);
});
app.delete('/usuarios/:id', verifyToken, authorize(['admin']), async (req, res) => {
    await Usuario.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

// BOLETAS
app.get('/boletas', verifyToken, authorize(['admin', 'vendedor']), async (req, res) => {
  const boletas = await Boleta.find().populate('usuario');
  res.json(boletas);
});
app.post('/boletas', async (req, res) => {
    const b = new Boleta(req.body);
    await b.save();
    res.status(201).json(b);
});

app.listen(PORT, () => {
  console.log(`🚀 API corriendo en puerto ${PORT}`);
});