import express from 'express';
import {
  getAllDados,
  getDadoById,
  createDado,
  updateDado,
  deleteDado,
  login,
} from '../controllers/controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', createDado);
router.get('/users', getAllDados);
router.get('/users/:id', getDadoById);
router.put('/users/:id', authenticateToken, updateDado);
router.delete('/users/:id', authenticateToken, deleteDado);

export { router };
