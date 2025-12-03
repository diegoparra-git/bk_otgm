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
const SECRET_KEY = 'A5ft9$kLzQ!wXyZ'; // Cambia esto por una clave segura en producción

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
// ROUTER v1 + SWAGGER
// ==========================================
const apiV1 = express.Router();

// Swagger UI for v1
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send(`
    <h1>Bienvenido a la API de On The Go Music </h1>
    <p>El servidor está funcionando correctamente.</p>
    <p>Visita <a href="/api/v1/docs">/api/v1/docs</a> para ver la documentación.</p>
  `);
});

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================

apiV1.post('/login', async (req, res) => {
    /* #swagger.tags = ['Auth']
       #swagger.summary = 'Iniciar sesión'
       #swagger.description = 'Logea un usuario y devuelve un token JWT.'
       #swagger.parameters['body'] = {
           in: 'body',
           description: 'Credenciales del usuario',
           required: true,
           schema: {
               $correo: "admin@duoc.cl",
               $password: "123456"
           }
       }
    */
  const { correo, password } = req.body;
  console.log(`📡 Intento de Login -> Correo: "${correo}", Pass: "${password}"`);

  try {
    const user = await Usuario.findOne({ 
        correo: { $regex: new RegExp(`^${correo}$`, 'i') } 
    });

    if (!user) return res.status(401).json({ message: 'Usuario no existe' });
    if (user.password !== password) return res.status(401).json({ message: 'Contraseña incorrecta' });

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
apiV1.post('/register', async (req, res) => {
    /* #swagger.tags = ['Auth']
       #swagger.summary = 'Registrar nuevo cliente'
       #swagger.parameters['body'] = {
           in: 'body',
           description: 'Datos del nuevo usuario',
           schema: {
               $nombre: "Juan Perez",
               $correo: "juan@example.com",
               $password: "secret",
               direccion: "Av. Siempre Viva 123"
           }
       }
    */
  try {
    const nuevoUsuario = new Usuario({ ...req.body, rol: 'cliente' });
    await nuevoUsuario.save();
    console.log('✅ Usuario registrado:', nuevoUsuario.correo);
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error('Error registro:', error);
    res.status(400).json({ message: 'Error registro', error });
  }
});

// CREAR USUARIO (Ruta usada por tu ViewModel addUser - Admin manual)
apiV1.post('/usuarios', async (req, res) => {
    /* #swagger.tags = ['Usuarios']
       #swagger.summary = 'Crear usuario (Admin manual)'
       #swagger.description = 'Permite crear usuarios con roles específicos'
       #swagger.parameters['body'] = {
           in: 'body',
           schema: {
               $nombre: "Admin",
               $correo: "admin@tienda.cl",
               $password: "admin123",
               $rol: "admin"
           }
       }
    */
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
// RUTAS DE PRODUCTOS
// ==========================================

apiV1.get('/productos', async (req, res) => {
    /* #swagger.tags = ['Productos']
        #swagger.summary = 'Listar todos los productos'
      */
  const productos = await Producto.find();
  res.json(productos);
});

apiV1.get('/productos/:id', async (req, res) => {
    /* #swagger.tags = ['Productos']
       #swagger.summary = 'Obtener producto por ID'
    */
    try {
        const p = await Producto.findById(req.params.id);
        p ? res.json(p) : res.status(404).json({message: 'No encontrado'});
    } catch(e) { res.status(500).json({message: e.message}); }
});

apiV1.post('/productos', verifyToken, authorize(['admin', 'vendedor']), async (req, res) => {
    /* #swagger.tags = ['Productos']
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.summary = 'Crear un nuevo producto'
       #swagger.parameters['body'] = {
           in: 'body',
           required: true,
           schema: {
               $nombre: "Guitarra Gibson",
               $precio: 990000,
               $categoria: "Cuerdas",
               $stock: 10,
               descripcion: "Guitarra eléctrica..."
           }
       }
    */
    try {
        const p = new Producto(req.body);
        await p.save();
        res.status(201).json(p);
    } catch(e) { res.status(400).json({message: e.message}); }
});

apiV1.put('/productos/:id', verifyToken, authorize(['admin', 'vendedor']), async (req, res) => {
    /* #swagger.tags = ['Productos']
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.summary = 'Actualizar producto'
       #swagger.parameters['body'] = {
           in: 'body',
           description: 'Campos a actualizar',
           schema: {
               precio: 850000,
               stock: 5
           }
       }
    */
    await Producto.findByIdAndUpdate(req.params.id, req.body);
    res.json({message: "Actualizado"});
});

apiV1.delete('/productos/:id', verifyToken, authorize(['admin', 'vendedor']), async (req, res) => {
    /* #swagger.tags = ['Productos']
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.summary = 'Eliminar producto'
    */
    await Producto.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

// ==========================================
// RUTAS DE USUARIOS (ADMIN)
// ==========================================

apiV1.get('/usuarios', verifyToken, authorize(['admin']), async (req, res) => {
    /* #swagger.tags = ['Usuarios']
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.summary = 'Listar todos los usuarios'
    */
  const usuarios = await Usuario.find();
  res.json(usuarios);
});

apiV1.put('/usuarios/:id', verifyToken, authorize(['admin']), async (req, res) => {
    /* #swagger.tags = ['Usuarios']
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.summary = 'Actualizar usuario'
    */
    const u = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(u);
});

apiV1.delete('/usuarios/:id', verifyToken, authorize(['admin']), async (req, res) => {
    /* #swagger.tags = ['Usuarios']
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.summary = 'Eliminar usuario'
    */
    await Usuario.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

// ==========================================
// RUTAS DE BOLETAS
// ==========================================

apiV1.get('/boletas', verifyToken, authorize(['admin', 'vendedor']), async (req, res) => {
    /* #swagger.tags = ['Boletas']
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.summary = 'Ver historial de ventas'
    */
  const boletas = await Boleta.find().populate('usuario');
  res.json(boletas);
});

apiV1.post('/boletas', async (req, res) => {
    /* #swagger.tags = ['Boletas']
       #swagger.summary = 'Generar nueva venta'
       #swagger.parameters['body'] = {
           in: 'body',
           schema: {
               $usuario: "ID_DEL_USUARIO",
               $productos: [
                   {
                       producto: "ID_PRODUCTO",
                       cantidad: 1,
                       precio: 1000
                   }
               ],
               $total: 1000
           }
       }
    */
    const b = new Boleta(req.body);
    await b.save();
    res.status(201).json(b);
});

// Mount v1 router
app.use('/api/v1', apiV1);

// Legacy root or health check
app.get('/', (req, res) => res.send('API running. Swagger: /api/v1/docs'));

app.listen(PORT, () => {
  console.log(`🚀 API corriendo en puerto ${PORT} (v1: /api/v1, docs: /api/v1/docs)`);
});