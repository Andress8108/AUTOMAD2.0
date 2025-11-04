import mongoose from 'mongoose';

const triageEvaluationSchema = new mongoose.Schema({
  // Referencia al paciente
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  identificacionPaciente: {
    type: String,
    required: true
  },
  nombrePaciente: {
    type: String,
    required: true
  },
  
  // Signos vitales
  vitalSigns: {
    temperatura: {
      type: String,
      required: true
    },
    presionSistolica: {
      type: String,
      required: true
    },
    presionDiastolica: {
      type: String,
      required: true
    },
    frecuenciaCardiaca: {
      type: String,
      required: true
    },
    frecuenciaRespiratoria: {
      type: String,
      required: true
    },
    saturacionO2: {
      type: String,
      required: true
    }
  },
  
  // Resultado del triage
  triageResult: {
    level: {
      type: String,
      required: true,
      enum: ['I', 'II', 'III', 'IV', 'V']
    },
    name: {
      type: String,
      required: true,
      enum: ['RESUCITACIÓN', 'EMERGENCIA', 'URGENCIA', 'URGENCIA MENOR', 'NO URGENTE']
    },
    priority: {
      type: String,
      required: true
    },
    maxWaitTime: {
      type: String,
      required: true
    }
  },
  
  // Metadatos de la evaluación
  evaluationDate: {
    type: Date,
    default: Date.now
  },
  evaluatedBy: {
    type: String,
    default: 'Sistema SAVISER'
  },
  status: {
    type: String,
    enum: ['PENDIENTE', 'EN_ATENCION', 'ATENDIDO', 'DERIVADO'],
    default: 'PENDIENTE'
  },
  
  // Observaciones adicionales
  observaciones: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
triageEvaluationSchema.index({ patientId: 1 });
triageEvaluationSchema.index({ identificacionPaciente: 1 });
triageEvaluationSchema.index({ 'triageResult.level': 1 });
triageEvaluationSchema.index({ evaluationDate: -1 });
triageEvaluationSchema.index({ status: 1 });

export default mongoose.model('TriageEvaluation', triageEvaluationSchema);