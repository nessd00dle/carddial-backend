import express from 'express';
import { body } from 'express-validator';
import { 
    crearUsuario, 
    crearUsuarioConFoto,
    loginUsuario, 
    obtenerPerfil,
    actualizarPerfil,
    actualizarFotoPerfil,
    obtenerUsuarios,
    obtenerUsuarioPorId,
    buscarUsuarios,
    obtenerPerfilPublico,
    obtenerColeccionPublica,
    cerrarSesion
} from '../controllers/usuarioController.js';
import { autenticarToken } from '../middleware/authMiddleware.js';
import { uploadPerfil } from '../config/upload.js';

const router = express.Router();

// Middleware simple para manejar upload de foto
const uploadFoto = (req, res, next) => {
    uploadPerfil.single('fotoPerfil')(req, res, (err) => {
        if (err) {
            console.error('Error en upload:', err);
            return res.status(400).json({ 
                error: 'Error al subir la imagen: ' + err.message 
            });
        }
        next();
    });
};

// Validaciones comunes
const validarRegistro = [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('nickname').notEmpty().withMessage('El nickname es obligatorio'),
    body('correo').isEmail().withMessage('Correo electrónico inválido'),
    body('contrasena').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
];

const validarLogin = [
    body('correo').isEmail().withMessage('Correo electrónico inválido'),
    body('contrasena').notEmpty().withMessage('La contraseña es obligatoria')
];

// Rutas públicas
router.post('/registro', validarRegistro, crearUsuario);
router.post('/registro-con-foto', uploadFoto, validarRegistro, crearUsuarioConFoto);
router.post('/login', validarLogin, loginUsuario);

// Rutas protegidas (requieren autenticación)
router.get('/perfil', autenticarToken, obtenerPerfil);
router.put('/perfil', autenticarToken, actualizarPerfil);
router.put('/perfil/foto', autenticarToken, uploadFoto, actualizarFotoPerfil);
router.post('/logout', autenticarToken, cerrarSesion);

// Rutas públicas de consulta
router.get('/', obtenerUsuarios);
router.get('/buscar', buscarUsuarios);
router.get('/publico/:identificador', obtenerPerfilPublico);
router.get('/:id', obtenerUsuarioPorId);
router.get('/:usuarioId/coleccion', obtenerColeccionPublica);

export default router;