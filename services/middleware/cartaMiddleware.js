import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { DIRECTORIOS } from '../config/upload.js';

// Configuración de almacenamiento para cartas
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const cartaDir = DIRECTORIOS.cartas;
        if (!fs.existsSync(cartaDir)) {
            fs.mkdirSync(cartaDir, { recursive: true });
        }
        cb(null, cartaDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `carta-${uniqueSuffix}${ext}`);
    }
});

// Filtro para imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|bmp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'));
    }
};

// Middleware para subir imagen de carta
export const uploadCartaImagen = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
}).single('imagen');

// Validar datos de carta
export const validarCarta = (req, res, next) => {
    const { nombre, idFranquicia, rareza } = req.body;
    
    const errores = [];
    
    if (!nombre || nombre.trim() === '') {
        errores.push('El nombre de la carta es obligatorio');
    }
    
    if (!idFranquicia) {
        errores.push('La franquicia es obligatoria');
    }
    
    if (rareza && !['común', 'poco común', 'rara', 'muy rara', 'ultra rara', 'legendaria'].includes(rareza)) {
        errores.push('Rareza no válida');
    }
    
    if (errores.length > 0) {
        return res.status(400).json({
            success: false,
            errores
        });
    }
    
    next();
};