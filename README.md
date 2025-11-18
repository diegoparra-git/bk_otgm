# **Backend On The Go Music (OTGM)**

Este repositorio contiene la lógica del lado del servidor (API REST) y la configuración de base de datos para la aplicación web **On The Go Music**.

El sistema está construido sobre una arquitectura **Node.js** con **Express**, y utiliza **MongoDB** como base de datos NoSQL para gestionar la persistencia de datos de manera flexible y escalable.

## **🛠 Tecnologías Principales**

* **Runtime:** Node.js  
* **Framework:** Express.js  
* **Base de Datos:** MongoDB (Community Edition)  
* **ODM:** Mongoose (Para modelado de datos y validaciones)  
* **Seguridad:** CORS habilitado para comunicación cruzada entre instancias.

## **📂 Estructura del Proyecto**

* **otgm-api/**: Carpeta raíz de la API.  
  * **index.js**: Punto de entrada del servidor. Configura Express, conecta a la BD y define las rutas.  
  * **models/**: Esquemas de datos (Mongoose) para Usuario, Producto y Boleta.  
  * **package.json**: Dependencias y scripts de ejecución.

## **🚀 Guía de Inicio Rápido**

Sigue estos pasos para levantar el entorno de backend en el servidor (EC2 Ubuntu).

### **1\. Iniciar el Servicio de Base de Datos**

Antes de correr la API, asegúrate de que el motor de base de datos MongoDB esté activo en el sistema.

sudo systemctl start mongod

**Nota:** Para verificar que está corriendo correctamente, puedes usar sudo systemctl status mongod.

### **2\. Iniciar el Servidor API**

Navega a la carpeta de la API e inicia el servidor en modo desarrollo (usando nodemon para recarga automática) o producción.

\# Entra a la carpeta del proyecto  
cd otgm-api

\# Instala dependencias (si es la primera vez)  
npm install

\# Ejecuta el servidor en modo desarrollo  
npm run dev

La API estará disponible en el puerto **3000** (por defecto).

## **🔌 Endpoints Principales**

| Método | Ruta | Descripción |
| :---- | :---- | :---- |
| POST | /login | Autenticación de usuarios (Admin/Cliente). |
| POST | /register | Registro de nuevos usuarios (Rol Cliente por defecto). |
| GET | /productos | Listar catálogo completo de productos. |
| POST | /productos | Crear un nuevo producto (Requiere body JSON). |
| GET | /boletas | Historial de ventas con detalles de usuario populados. |
| GET | /usuarios | Gestión de usuarios (Solo Admin). |

## **📝 Notas de Despliegue**

* La conexión a la base de datos está configurada para **localhost** (0.0.0.0:27017).  
* Asegúrate de que el **Security Group** de AWS tenga abierto el puerto 3000 (TCP) para permitir el tráfico entrante desde la instancia de Frontend.
