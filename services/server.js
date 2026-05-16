import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';
import connectDB from "./config/dbClient.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import publiRoutes from "./routes/publiRoutes.js";
import reaccionRoutes from './routes/reaccionRoutes.js';
import franquiciaRoutes from "./routes/franquiciaRoutes.js";
import comentarioRoutes from "./routes/comentarioRoutes.js";
import cartaRoutes from "./routes/cartaRoutes.js";
import coleccionRoutes from "./routes/coleccionRoutes.js";
import reporteRoutes from './routes/reporteRoutes.js';
import estadisticaRoutes from './routes/estadisticaRoutes.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

connectDB();

// Configurar CORS
app.use(cors({
    origin: ['https://carddial-bjcxfac5acdxbvah.canadacentral-01.azurewebsites.net', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar ruta de uploads
const uploadsPath = path.join(__dirname, '..', 'uploads');

console.log('========================================');
console.log('CONFIGURACION DE SERVIDOR');
console.log('========================================');
console.log('Directorio actual:', __dirname);
console.log('Ruta de uploads:', uploadsPath);
console.log('Existe uploads?', fs.existsSync(uploadsPath));

// así se sirven los fokin archivos estáticos de uploads
app.use('/uploads', express.static(uploadsPath, {
    setHeaders: (res, filePath) => {
  
        res.setHeader('Cache-Control', 'public, max-age=86400');
        console.log('Sirviendo archivo:', filePath);
    }
}));

// Rutas estáticas específicas (para compatibilidad)
app.use('/uploads/publicaciones', express.static(path.join(uploadsPath, 'publicaciones')));
app.use('/uploads/perfiles', express.static(path.join(uploadsPath, 'perfiles')));
app.use('/uploads/cartas', express.static(path.join(uploadsPath, 'cartas')));

// Endpoint para obtener URL correcta de imágenes
app.get('/api/imagen/:tipo/:nombre', (req, res) => {
    const { tipo, nombre } = req.params;
    const imagePath = path.join(uploadsPath, tipo, nombre);
    
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.status(404).json({ error: 'Imagen no encontrada' });
    }
});

// Endpoint de diagnóstico
app.get('/api/debug/db-info', async (req, res) => {
    try {
        const db = mongoose.connection;
        const collections = await db.db.listCollections().toArray();
        
        const Franquicia = (await import('./models/franquiciaModel.js')).default;
        const franquiciasCount = await Franquicia.countDocuments();
        
        res.json({
            connected: db.readyState === 1,
            databaseName: db.name,
            host: db.host,
            collections: collections.map(c => c.name),
            franquiciasCount: franquiciasCount,
            baseUrl: `${req.protocol}://${req.get('host')}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rutas de la API
app.use('/api/publicaciones', publiRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/franquicias', franquiciaRoutes);
app.use('/api/publicaciones/:idPublicacion/comentarios', comentarioRoutes);
app.use('/api/cartas', cartaRoutes);
app.use('/api/colecciones', coleccionRoutes);
app.use('/api/publicaciones/:idPublicacion/reacciones', reaccionRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/estadisticas', estadisticaRoutes);

app.get('/', (req, res) => {
    res.send('API funcionando');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(` Servidor corriendo en puerto ${PORT}`);
    console.log(` Base URL: http://localhost:${PORT}`);
});