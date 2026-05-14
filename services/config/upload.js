import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorios base
const UPLOADS_BASE = path.join(__dirname, '../../uploads');
export const DIRECTORIOS = {
    perfiles: path.join(UPLOADS_BASE, 'perfiles'),
    publicaciones: path.join(UPLOADS_BASE, 'publicaciones'),
    cartas: path.join(UPLOADS_BASE, 'cartas')
};

// Crear directorios si no existen
Object.values(DIRECTORIOS).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Directorio creado: ${dir}`);
    }
});

// Configuración de almacenamiento dinámico
const storage = (tipo) => multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIRECTORIOS[tipo]);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        const prefix = tipo === 'perfiles' ? 'perf' : (tipo === 'publicaciones' ? 'pub' : 'carta');
        cb(null, `${prefix}-${uniqueSuffix}${ext}`);
    }
});

// Filtro común para imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|bmp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WEBP, BMP)'));
    }
};

// Configuración base de multer
const crearMulter = (tipo, maxFiles = 1, maxSize = 5 * 1024 * 1024) => {
    return multer({
        storage: storage(tipo),
        limits: {
            fileSize: maxSize,
            files: maxFiles
        },
        fileFilter: fileFilter
    });
};

// Middlewares específicos
export const uploadPerfil = crearMulter('perfiles', 1);
export const uploadPublicacion = crearMulter('publicaciones', 10);
export const uploadCartas = crearMulter('cartas', 20);

// Middleware para subir imágenes de publicación
export const uploadPublicacionImages = (req, res, next) => {
    const upload = uploadPublicacion.array('imagenes', 10);
    upload(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'FILE_TOO_LARGE') {
                    return res.status(400).json({
                        success: false,
                        message: 'El archivo es demasiado grande. Máximo 5MB'
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        success: false,
                        message: 'Máximo 10 imágenes por publicación'
                    });
                }
            }
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        
        if (req.files && req.files.length > 0) {
            console.log(`📸 ${req.files.length} imágenes subidas para publicación`);
        }
        
        next();
    });
};