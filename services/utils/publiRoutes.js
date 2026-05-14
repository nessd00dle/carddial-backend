import express from 'express';
import {
    obtenerPublicaciones,
    obtenerPublicacionesPorUsuario,
    obtenerPublicacionPorId,
    crearPublicacion,
    actualizarPublicacion,
    eliminarPublicacion,
    toggleLike,
    agregarComentario,
    eliminarComentario
} from '../controllers/publiController.js';
import { autenticarToken } from '../middleware/authMiddleware.js';
import { uploadPublicacionImages } from '../config/upload.js';
import { validarPublicacion, sanitizarPublicacion, validarComentario } from '../middleware/publiMiddleware.js';

const router = express.Router();

// Rutas públicas (solo lectura)
router.get('/', obtenerPublicaciones);
router.get('/usuario/:usuarioId', obtenerPublicacionesPorUsuario);
router.get('/:id', obtenerPublicacionPorId);

// Rutas protegidas (requieren autenticación)
router.post('/', 
    autenticarToken,
    uploadPublicacionImages,
    validarPublicacion,
    sanitizarPublicacion,
    crearPublicacion
);

router.put('/:id', 
    autenticarToken,
    sanitizarPublicacion,
    actualizarPublicacion
);

router.delete('/:id', 
    autenticarToken,
    eliminarPublicacion
);

// Rutas de interacción
router.post('/:id/like', 
    autenticarToken,
    toggleLike
);

router.post('/:id/comentario', 
    autenticarToken,
    validarComentario,
    agregarComentario
);

router.delete('/:id/comentario/:comentarioId', 
    autenticarToken,
    eliminarComentario
);

export default router;