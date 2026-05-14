import express from 'express';
import {
    obtenerComentarios,
    crearComentario,
    toggleLikeComentario,
    eliminarComentario
} from '../controllers/comentarioController.js';
import { autenticarToken } from '../middleware/authMiddleware.js';
import { validarComentario } from '../middleware/comentarioMiddleware.js';

const router = express.Router({ mergeParams: true });

// Rutas protegidas
router.get('/', obtenerComentarios);
router.post('/', autenticarToken, validarComentario, crearComentario);
router.post('/:id/like', autenticarToken, toggleLikeComentario);
router.delete('/:id', autenticarToken, eliminarComentario);

export default router;