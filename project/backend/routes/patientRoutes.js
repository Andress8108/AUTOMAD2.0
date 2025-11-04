import express from 'express';
import {
  createPatient,
  getPatientByIdentification,
  getAllPatients,
  updatePatient,
  deletePatient
} from '../controllers/patientController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas (para el sistema de triage y dashboard)
router.post('/', createPatient);
router.get('/identification/:identificacion', getPatientByIdentification);
router.get('/', getAllPatients);

// Rutas protegidas
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'MEDICO', 'ENFERMERO'), updatePatient);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deletePatient);

export default router;