const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger_output.json'); // Or wherever your swagger.json is located

// Importar Modelos
const Producto = require('./models/Producto');
const Usuario = require('./models/Usuario');
const Boleta = require('./models/Boleta');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Conexión a MongoDB (Localhost)
const MONGO_URI = 'mongodb://127.0.0.1:27017/onthegomusic';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error MongoDB:', err));

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================
app.post('/login', async (req, res) => {
  // #swagger.tags = ['Autenticación']
  // #swagger.summary = 'Iniciar sesión'
  // #swagger.description = 'Retorna el usuario sin la contraseña.'
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Credenciales',
        schema: { $ref: '#/definitions/Login' }
  } */
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
  // #swagger.tags = ['Autenticación']
  // #swagger.summary = 'Registrar nuevo usuario'
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Datos del usuario',
        schema: { $ref: '#/definitions/NuevoUsuario' }
  } */
  try {
    const nuevoUsuario = new Usuario({ ...req.body, rol: 'cliente' });
    await nuevoUsuario.save();
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(400).json({ message: 'Error registro', error });
  }
});

// ==========================================
// RUTAS DE PRODUCTOS
// ==========================================
app.get('/productos', async (req, res) => {
  // #swagger.tags = ['Productos']
  // #swagger.summary = 'Listar catálogo'
  const productos = await Producto.find();
  res.json(productos);
});

app.get('/productos/:id', async (req, res) => {
  // #swagger.tags = ['Productos']
  // #swagger.summary = 'Obtener detalle de producto'
  // #swagger.parameters['id'] = { description: 'ID del producto' }
  try {
    const producto = await Producto.findById(req.params.id);
    producto ? res.json(producto) : res.status(404).json({ message: 'No encontrado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/productos', async (req, res) => {
  // #swagger.tags = ['Productos']
  // #swagger.summary = 'Crear producto'
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Información del producto',
        schema: { $ref: '#/definitions/NuevoProducto' }
  } */
  try {
    const producto = new Producto(req.body);
    await producto.save();
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/productos/:id', async (req, res) => {
  // #swagger.tags = ['Productos']
  // #swagger.summary = 'Actualizar producto'
  // #swagger.parameters['id'] = { description: 'ID del producto' }
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Información actualizada del producto',
        schema: { $ref: '#/definitions/NuevoProducto' }
  } */
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(producto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/productos/:id', async (req, res) => {
  // #swagger.tags = ['Productos']
  // #swagger.summary = 'Eliminar producto'
  // #swagger.parameters['id'] = { description: 'ID del producto' }
  try {
    await Producto.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// RUTAS DE USUARIOS
// ==========================================
app.get('/usuarios', async (req, res) => {
  // #swagger.tags = ['Usuarios']
  // #swagger.summary = 'Listar usuarios (Admin)'
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/usuarios', async (req, res) => {
  // #swagger.tags = ['Usuarios']
  // #swagger.summary = 'Crear nuevo usuario (Admin)'
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Datos del nuevo usuario',
        schema: { $ref: '#/definitions/NuevoUsuario' }
  } */
  try {
    const usuario = new Usuario(req.body);
    await usuario.save();
    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- ESTAS ERAN LAS QUE FALTABAN ---

// PUT: Editar Usuario
app.put('/usuarios/:id', async (req, res) => {
  // #swagger.tags = ['Usuarios']
  // #swagger.summary = 'Editar usuario (Admin)'
  // #swagger.parameters['id'] = { description: 'ID del usuario' }
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Datos actualizados del usuario',
        schema: { $ref: '#/definitions/NuevoUsuario' }
  } */
  try {
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Eliminar Usuario
app.delete('/usuarios/:id', async (req, res) => {
  // #swagger.tags = ['Usuarios']
  // #swagger.summary = 'Eliminar usuario (Admin)'
  // #swagger.parameters['id'] = { description: 'ID del usuario' }
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    
    if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.status(204).send(); // 204 No Content (Éxito)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// RUTAS DE BOLETAS
// ==========================================
app.get('/boletas', async (req, res) => {
  // #swagger.tags = ['Boletas']
  // #swagger.summary = 'Historial de ventas'
  try {
    const boletas = await Boleta.find().populate('usuario'); 
    res.json(boletas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/boletas', async (req, res) => {
  // #swagger.tags = ['Boletas']
  // #swagger.summary = 'Generar nueva venta'
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Detalle de la boleta',
        schema: { $ref: '#/definitions/NuevaBoleta' }
  } */
  try {
    const boleta = new Boleta(req.body);
    await boleta.save();
    res.status(201).json(boleta);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API corriendo en puerto ${PORT}`);
});


// TODO: {pipe} Mostrar rutas api en swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});