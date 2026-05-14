import express from 'express';
import {
    obtenerCartas,
    obtenerCartaPorId,
    crearCarta,
    actualizarCarta,
    eliminarCarta
} from '../controllers/cartaController.js';
import { autenticarToken } from '../middleware/authMiddleware.js';
import { uploadCartaImagen, validarCarta } from '../middleware/cartaMiddleware.js';

const router = express.Router();

// Rutas públicas
router.get('/', obtenerCartas);
router.get('/:id', obtenerCartaPorId);

// Rutas protegidas
router.post('/',
    autenticarToken,
    uploadCartaImagen,
    validarCarta,
    crearCarta
);

router.put('/:id',
    autenticarToken,
    uploadCartaImagen,
    validarCarta,
    actualizarCarta
);

router.delete('/:id',
    autenticarToken,
    eliminarCarta
);

export default router;