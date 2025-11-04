import express from 'express';
import {
  createTriageEvaluation,
  getTriageEvaluationById,
  getAllTriageEvaluations,
  updateTriageStatus,
  getTriageStats
} from '../controllers/triageController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas (para el sistema de triage y dashboard)
router.post('/', createTriageEvaluation);
router.get('/', getAllTriageEvaluations);
router.get('/stats', getTriageStats);
router.get('/:id', getTriageEvaluationById);

// Rutas protegidas
router.put('/:id/status', authenticateToken, authorizeRoles('ADMIN', 'MEDICO', 'ENFERMERO'), updateTriageStatus);

export default router;