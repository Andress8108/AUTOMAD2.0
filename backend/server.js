import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import triageRoutes from './routes/triageRoutes.js';

// Configurar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/triage', triageRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor SAVISER funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta para obtener información del sistema
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Sistema SAVISER Backend',
      version: '1.0.0',
      description: 'API para el Sistema de Clasificación de Triage',
      authors: [
        'Camilo Andrés Payares Payares',
        'Jesús Adrián Anaya Polo',
        'Julián David Gómez Esquivel',
        'Isac Manuel Flores Durango'
      ],
      endpoints: {
        auth: '/api/auth',
        patients: '/api/patients',
        triage: '/api/triage',
        health: '/api/health'
      }
    }
  });
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Middleware global para manejo de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(` Servidor SAVISER iniciado en puerto ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
 
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log(' Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log(' Cerrando servidor...');
  process.exit(0);
});