import Patient from '../models/Patient.js';

// Crear nuevo paciente
export const createPatient = async (req, res) => {
  try {
    const patientData = req.body;
    
    // Verificar si ya existe un paciente con esa identificación
    const existingPatient = await Patient.findOne({ 
      identificacion: patientData.identificacion 
    });
    
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un paciente registrado con esta identificación',
        data: existingPatient
      });
    }
    
    const newPatient = new Patient(patientData);
    const savedPatient = await newPatient.save();
    
    res.status(201).json({
      success: true,
      message: 'Paciente registrado exitosamente',
      data: savedPatient
    });
  } catch (error) {
    console.error('Error creando paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener paciente por identificación
export const getPatientByIdentification = async (req, res) => {
  try {
    const { identificacion } = req.params;
    
    const patient = await Patient.findOne({ identificacion });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error obteniendo paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todos los pacientes
export const getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = search ? {
      $or: [
        { nombre: { $regex: search, $options: 'i' } },
        { identificacion: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Patient.countDocuments(query);

    console.log('Pacientes encontrados:', patients.length);
    console.log('Primer paciente:', patients[0]);

    res.json({
      success: true,
      data: patients,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: parseInt(page) < Math.ceil(total / limit),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error obteniendo pacientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar paciente
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedPatient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Paciente actualizado exitosamente',
      data: updatedPatient
    });
  } catch (error) {
    console.error('Error actualizando paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar paciente
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedPatient = await Patient.findByIdAndDelete(id);
    
    if (!deletedPatient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Paciente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};