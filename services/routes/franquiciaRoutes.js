import express from 'express';
import {
    obtenerFranquicias,
    obtenerFranquiciaPorId,
    crearFranquicia,
    actualizarFranquicia
} from '../controllers/franquiciaController.js';
import { autenticarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.get('/', obtenerFranquicias);
router.get('/:id', obtenerFranquiciaPorId);

// Rutas protegidas , estas a lo mejor ni dse usan porque no hay un admin, pero por si acaso las dejo
router.post('/', autenticarToken, crearFranquicia);
router.put('/:id', autenticarToken, actualizarFranquicia);

export default router;