import TriageEvaluation from '../models/TriageEvaluation.js';
import Patient from '../models/Patient.js';

// Función para calcular el nivel de triage
const calculateTriageLevel = (vitalSigns) => {
  const temp = parseFloat(vitalSigns.temperatura);
  const sistolica = parseFloat(vitalSigns.presionSistolica);
  const diastolica = parseFloat(vitalSigns.presionDiastolica);
  const fc = parseFloat(vitalSigns.frecuenciaCardiaca);
  const fr = parseFloat(vitalSigns.frecuenciaRespiratoria);
  const o2 = parseFloat(vitalSigns.saturacionO2);

  // Nivel I - RESUCITACIÓN (Crítico)
  if (
    temp > 40 || temp < 35 ||
    sistolica > 180 || sistolica < 90 ||
    fc > 120 || fc < 50 ||
    o2 < 90
  ) {
    return {
      level: 'I',
      name: 'RESUCITACIÓN',
      priority: 'CRÍTICO - Atención inmediata',
      maxWaitTime: 'Inmediato'
    };
  }

  // Nivel II - EMERGENCIA (Muy urgente)
  if (
    temp > 39 || temp < 35.5 ||
    sistolica > 160 || sistolica < 100 ||
    fc > 110 || fc < 60 ||
    fr > 24 || fr < 12 ||
    o2 < 92
  ) {
    return {
      level: 'II',
      name: 'EMERGENCIA',
      priority: 'MUY URGENTE - Atención en 10 minutos',
      maxWaitTime: '10 minutos'
    };
  }

  // Nivel III - URGENCIA (Urgente)
  if (
    temp > 38.5 ||
    sistolica > 140 || sistolica < 110 ||
    fc > 100 ||
    fr > 22 || fr < 14 ||
    o2 < 94
  ) {
    return {
      level: 'III',
      name: 'URGENCIA',
      priority: 'URGENTE - Atención en 60 minutos',
      maxWaitTime: '60 minutos'
    };
  }

  // Nivel IV - URGENCIA MENOR (Menos urgente)
  if (
    temp > 37.5 ||
    sistolica > 130 ||
    fc > 90
  ) {
    return {
      level: 'IV',
      name: 'URGENCIA MENOR',
      priority: 'MENOS URGENTE - Atención en 120 minutos',
      maxWaitTime: '120 minutos'
    };
  }

  // Nivel V - NO URGENTE
  return {
    level: 'V',
    name: 'NO URGENTE',
    priority: 'NO URGENTE - Atención en 240 minutos',
    maxWaitTime: '240 minutos'
  };
};

// Crear nueva evaluación de triage
export const createTriageEvaluation = async (req, res) => {
  try {
    const { patientId, vitalSigns, observaciones = '' } = req.body;
    
    // Verificar que el paciente existe
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }
    
    // Calcular el nivel de triage
    const triageResult = calculateTriageLevel(vitalSigns);
    
    // Crear la evaluación
    const triageEvaluation = new TriageEvaluation({
      patientId,
      identificacionPaciente: patient.identificacion,
      nombrePaciente: patient.nombre,
      vitalSigns,
      triageResult,
      observaciones
    });
    
    const savedEvaluation = await triageEvaluation.save();
    
    // Poblar los datos del paciente
    await savedEvaluation.populate('patientId');
    
    res.status(201).json({
      success: true,
      message: 'Evaluación de triage creada exitosamente',
      data: savedEvaluation
    });
  } catch (error) {
    console.error('Error creando evaluación de triage:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener evaluación por ID
export const getTriageEvaluationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const evaluation = await TriageEvaluation.findById(id).populate('patientId');
    
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluación no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    console.error('Error obteniendo evaluación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todas las evaluaciones
export const getAllTriageEvaluations = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      level = '', 
      status = '', 
      search = '' 
    } = req.query;
    
    let query = {};
    
    // Filtros
    if (level) query['triageResult.level'] = level;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { nombrePaciente: { $regex: search, $options: 'i' } },
        { identificacionPaciente: { $regex: search, $options: 'i' } }
      ];
    }
    
    const evaluations = await TriageEvaluation.find(query)
      .populate('patientId')
      .sort({ evaluationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await TriageEvaluation.countDocuments(query);
    
    res.json({
      success: true,
      data: evaluations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error obteniendo evaluaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar estado de evaluación
export const updateTriageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, observaciones } = req.body;
    
    const updatedEvaluation = await TriageEvaluation.findByIdAndUpdate(
      id,
      { status, observaciones },
      { new: true, runValidators: true }
    ).populate('patientId');
    
    if (!updatedEvaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluación no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Estado de evaluación actualizado exitosamente',
      data: updatedEvaluation
    });
  } catch (error) {
    console.error('Error actualizando evaluación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de triage
export const getTriageStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        evaluationDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    
    // Estadísticas por nivel de triage
    const levelStats = await TriageEvaluation.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$triageResult.level',
          count: { $sum: 1 },
          name: { $first: '$triageResult.name' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Estadísticas por estado
    const statusStats = await TriageEvaluation.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Total de evaluaciones
    const totalEvaluations = await TriageEvaluation.countDocuments(dateFilter);
    
    // Evaluaciones por día (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyStats = await TriageEvaluation.aggregate([
      {
        $match: {
          evaluationDate: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$evaluationDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalEvaluations,
        levelStats,
        statusStats,
        dailyStats
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};