import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  // Datos personales
  identificacion: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  edad: {
    type: String,
    required: true
  },
  sexo: {
    type: String,
    required: true,
    enum: ['MASCULINO', 'FEMENINO', 'OTRO']
  },
  tipoSangre: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  alergias: {
    type: String,
    trim: true,
    default: ''
  },
  enfermedadesBase: {
    type: String,
    trim: true,
    default: ''
  },
  medicamentosActuales: {
    type: String,
    trim: true,
    default: ''
  },
  motivoConsulta: {
    type: String,
    required: true,
    trim: true
  },
  acompanante: {
    type: String,
    trim: true,
    default: ''
  },
  fechaHora: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
patientSchema.index({ nombre: 1 });
patientSchema.index({ createdAt: -1 });

export default mongoose.model('Patient', patientSchema);