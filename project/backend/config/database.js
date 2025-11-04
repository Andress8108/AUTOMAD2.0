import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(` MongoDB conectado: ${conn.connection.host}`);
    console.log(` Base de datos: ${conn.connection.name}`);
  } catch (error) {
    console.error(' Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

//  Eventos de conexión
mongoose.connection.on('connected', () => {
  console.log(' Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(' Error de conexión MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log(' Mongoose desconectado de MongoDB');
});

//  Cerrar conexión al terminar la app
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log(' Conexión MongoDB cerrada por terminación de la aplicación');
  process.exit(0);
});

export default connectDB;
