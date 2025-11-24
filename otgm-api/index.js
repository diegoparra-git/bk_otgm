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

// ==========================================
// RUTAS DE PRODUCTOS
// ==========================================
app.get('/productos', async (req, res) => {
  const productos = await Producto.find();
  res.json(productos);
});

app.get('/productos/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    producto ? res.json(producto) : res.status(404).json({ message: 'No encontrado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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

// --- ESTAS ERAN LAS QUE FALTABAN ---

// PUT: Editar Usuario
app.put('/usuarios/:id', async (req, res) => {
  try {
    // { new: true } devuelve el usuario ya modificado
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
  try {
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
  console.log(`🚀 API corriendo en puerto ${PORT}`);
});


// TODO: {pipe} Mostrar rutas api en swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});


// TODO: MARCELO ARREGLA ESTO

// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const swaggerUi = require('swagger-ui-express');

// // Import the generated swagger_output.json file
// // You must run `npm run swagger-autogen` in your terminal after adding comments
// const swaggerDocument = require('./swagger_output.json'); 

// // Import Models
// const Producto = require('./models/Producto');
// const Usuario = require('./models/Usuario');
// const Boleta = require('./models/Boleta');

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(express.json());
// app.use(cors());

// // Conexión a MongoDB (Localhost)
// const MONGO_URI = 'mongodb://127.0.0.1:27017/onthegomusic';
// mongoose.connect(MONGO_URI)
//   .then(() => console.log('✅ Conectado a MongoDB'))
//   .catch(err => console.error('❌ Error MongoDB:', err));

// // ==========================================
// // RUTAS DE AUTENTICACIÓN
// // ==========================================

// /**
//  * @route POST /login
//  * @group Authentication - User login and registration
//  * @param {LoginUser.model} body.body.required - User credentials
//  * @returns {object} 200 - User object (without sensitive data like password)
//  * @returns {Error} 401 - Invalid credentials
//  * @returns {Error} 500 - Server error
//  */
// app.post('/login', async (req, res) => {
//   const { correo, password } = req.body;
//   try {
//     const user = await Usuario.findOne({ correo, password });
//     if (user) {
//       // Avoid returning the password in the response
//       const { password, ...userWithoutPass } = user.toObject();
//       res.json(userWithoutPass);
//     } else {
//       res.status(401).json({ message: 'Credenciales inválidas' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Error servidor' });
//   }
// });

// /**
//  * @route POST /register
//  * @group Authentication - User login and registration
//  * @param {RegisterUser.model} body.body.required - The new user registration details
//  * @returns {object} 201 - Newly created user object
//  * @returns {Error} 400 - Error registration
//  */
// app.post('/register', async (req, res) => {
//   try {
//     // Default rol to 'cliente' if not provided explicitly in the body
//     const nuevoUsuario = new Usuario({ ...req.body, rol: req.body.rol || 'cliente' });
//     await nuevoUsuario.save();
//     res.status(201).json(nuevoUsuario);
//   } catch (error) {
//     res.status(400).json({ message: 'Error registro', error });
//   }
// });

// // ==========================================
// // RUTAS DE PRODUCTOS
// // ==========================================

// /**
//  * @route GET /productos
//  * @group Products - Product management endpoints
//  * @returns {Array.<Product>} 200 - An array of products
//  */
// app.get('/productos', async (req, res) => {
//   const productos = await Producto.find();
//   res.json(productos);
// });

// /**
//  * @route GET /productos/:id
//  * @group Products - Product management endpoints
//  * @param {string} id.path.required - The ID of the product
//  * @returns {object} 200 - A single product object
//  * @returns {Error} 404 - Product not found
//  */
// app.get('/productos/:id', async (req, res) => {
//   try {
//     const producto = await Producto.findById(req.params.id);
//     producto ? res.json(producto) : res.status(404).json({ message: 'No encontrado' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// /**
//  * @route POST /productos
//  * @group Products - Product management endpoints
//  * @param {Product.model} body.body.required - The new product information
//  * @returns {object} 201 - The created product
//  * @returns {Error} 400 - Bad request error
//  */
// app.post('/productos', async (req, res) => {
//   try {
//     const producto = new Producto(req.body);
//     await producto.save();
//     res.status(201).json(producto);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// /**
//  * @route PUT /productos/:id
//  * @group Products - Product management endpoints
//  * @param {string} id.path.required - The ID of the product
//  * @param {Product.model} body.body.required - The updated product information
//  * @returns {object} 200 - The updated product
//  * @returns {Error} 400 - Bad request error
//  */
// app.put('/productos/:id', async (req, res) => {
//   try {
//     const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(producto);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// /**
//  * @route DELETE /productos/:id
//  * @group Products - Product management endpoints
//  * @param {string} id.path.required - The ID of the product
//  * @returns {object} 204 - No content, successful deletion
//  * @returns {Error} 500 - Server error
//  */
// app.delete('/productos/:id', async (req, res) => {
//   try {
//     await Producto.findByIdAndDelete(req.params.id);
//     res.status(204).send();
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ==========================================
// // RUTAS DE USUARIOS
// // ==========================================

// /**
//  * @route GET /usuarios
//  * @group Users - User management endpoints
//  * @returns {Array.<RegisterUser>} 200 - An array of users
//  */
// app.get('/usuarios', async (req, res) => {
//   try {
//     const usuarios = await Usuario.find();
//     res.json(usuarios);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// /**
//  * @route POST /usuarios
//  * @group Users - User management endpoints
//  * @param {RegisterUser.model} body.body.required - The new user information
//  * @returns {object} 201 - The created user
//  * @returns {Error} 400 - Bad request error
//  */
// app.post('/usuarios', async (req, res) => {
//   try {
//     const usuario = new Usuario(req.body);
//     await usuario.save();
//     res.status(201).json(usuario);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// /**
//  * @route PUT /usuarios/:id
//  * @group Users - User management endpoints
//  * @param {string} id.path.required - The ID of the user
//  * @param {RegisterUser.model} body.body.required - The updated user information
//  * @returns {object} 200 - The updated user
//  * @returns {Error} 404 - User not found
//  */
// app.put('/usuarios/:id', async (req, res) => {
//   try {
//     // { new: true } returns the modified user
//     const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
//     if (!usuario) {
//         return res.status(404).json({ message: 'Usuario no encontrado' });
//     }
    
//     res.json(usuario);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// /**
//  * @route DELETE /usuarios/:id
//  * @group Users - User management endpoints
//  * @param {string} id.path.required - The ID of the user
//  * @returns {object} 204 - No content, successful deletion
//  * @returns {Error} 404 - User not found
//  */
// app.delete('/usuarios/:id', async (req, res) => {
//   try {
//     const usuario = await Usuario.findByIdAndDelete(req.params.id);
    
//     if (!usuario) {
//         return res.status(404).json({ message: 'Usuario no encontrado' });
//     }
    
//     res.status(204).send(); // 204 No Content (Éxito)
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ==========================================
// // RUTAS DE BOLETAS (ORDERS)
// // ==========================================

// /**
//  * @route GET /boletas
//  * @group Orders - Boleta (Order) management endpoints
//  * @returns {Array.<Order>} 200 - An array of orders with populated user details
//  */
// app.get('/boletas', async (req, res) => {
//   try {
//     // Populates the 'usuario' field with details from the Usuario model
//     const boletas = await Boleta.find().populate('usuario'); 
//     res.json(boletas);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// /**
//  * @route POST /boletas
//  * @group Orders - Boleta (Order) management endpoints
//  * @param {Order.model} body.body.required - The new order information
//  * @returns {object} 201 - The created order
//  * @returns {Error} 400 - Bad request error
//  */
// app.post('/boletas', async (req, res) => {
//   try {
//     const boleta = new Boleta(req.body);
//     await boleta.save();
//     res.status(201).json(boleta);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // ==========================================
// // SWAGGER UI SETUP
// // ==========================================

// // This hosts the Swagger UI at http://localhost:3000/api-docs
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// app.listen(PORT, () => {
//   console.log(`🚀 API corriendo en puerto ${PORT}`);
//   console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
// });