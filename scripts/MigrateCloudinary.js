// scripts/migrateCartasToCloudinary.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function migrateCartasToCloudinary() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(' Conectado a MongoDB');
        
        // Importar modelo después de la conexión
        const Carta = (await import('../models/cartaModel.js')).default;
        
        // Buscar cartas que no tienen imagenPublicId o que tienen URLs locales
        const cartas = await Carta.find({
            $or: [
                { imagenPublicId: { $exists: false } },
                { imagen: { $regex: '^/uploads' } },
                { imagen: { $regex: '^http://localhost' } }
            ]
        });
        
        console.log(`Cartas a migrar: ${cartas.length}`);
        
        let migradas = 0;
        let errores = 0;
        
        for (const carta of cartas) {
            try {
                // Extraer nombre del archivo de la ruta local
                let localImagePath = null;
                
                if (carta.imagen && carta.imagen.includes('/uploads/')) {
                    const fileName = carta.imagen.split('/').pop();
                    // Buscar en diferentes carpetas posibles
                    const posiblesRutas = [
                        path.join(__dirname, '../uploads/cartas', fileName),
                        path.join(__dirname, '../uploads/cartas/imagesPokemon', fileName),
                        path.join(__dirname, '../uploads/cartas/imagesMagic', fileName),
                        path.join(__dirname, '../uploads/cartas/imagesDB', fileName),
                        path.join(__dirname, '../uploads/cartas/imagesYugioh', fileName),
                        path.join(__dirname, '../uploads/cartas/imagesDigimon', fileName),
                    ];
                    
                    for (const ruta of posiblesRutas) {
                        if (fs.existsSync(ruta)) {
                            localImagePath = ruta;
                            break;
                        }
                    }
                }
                
                if (localImagePath && fs.existsSync(localImagePath)) {
                    // Subir a Cloudinary
                    const franquiciaSlug = carta.idFranquicia?.slug || 'general';
                    const result = await cloudinary.uploader.upload(localImagePath, {
                        folder: `cartas/${franquiciaSlug}`,
                        public_id: `${carta._id}_${carta.nombre.replace(/\s/g, '_')}`,
                        transformation: [
                            { width: 500, height: 500, crop: 'limit' },
                            { quality: 'auto' }
                        ]
                    });
                    
                    // Actualizar la carta
                    carta.imagen = result.secure_url;
                    carta.imagenPublicId = result.public_id;
                    await carta.save();
                    
                    console.log(`Migrada: ${carta.nombre} -> ${result.secure_url}`);
                    migradas++;
                } else {
                    console.log(`Imagen no encontrada localmente para: ${carta.nombre}`);
                    // Asignar imagen por defecto
                    carta.imagen = `https://via.placeholder.com/300x300?text=${encodeURIComponent(carta.nombre)}`;
                    await carta.save();
                    console.log(`Asignada imagen placeholder para: ${carta.nombre}`);
                }
                
            } catch (error) {
                console.error(`Error migrando ${carta.nombre}:`, error.message);
                errores++;
            }
        }
        
        console.log('\n Resumen de migración:');
        console.log(`Migradas exitosamente: ${migradas}`);
        console.log(`Errores: ${errores}`);
        console.log(`Total procesadas: ${cartas.length}`);
        
        await mongoose.disconnect();
        console.log('Migración completada');
        
    } catch (error) {
        console.error('Error:', error);
    }
}

migrateCartasToCloudinary();