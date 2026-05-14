import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { DIRECTORIOS } from '../config/upload.js';

export const optimizarImagen = async (file, tipo = 'publicaciones') => {
    try {
        const configs = {
            perfiles: { width: 200, height: 200, quality: 85 },
            publicaciones: { width: 1200, height: 1200, quality: 80 },
            cartas: { width: 500, height: 700, quality: 90 }
        };
        
        const config = configs[tipo] || configs.publicaciones;
        
        // Validar que el archivo existe
        if (!file || !file.path) {
            console.error('❌ Archivo no válido:', file);
            return false;
        }
        
        console.log(`🖼️ Optimizando imagen ${tipo}:`, file.path);
        console.log(`📏 Dimensiones objetivo: ${config.width}x${config.height}`);
        
        // Verificar que el archivo existe en el sistema
        if (!fs.existsSync(file.path)) {
            console.error(`❌ Archivo no encontrado: ${file.path}`);
            return false;
        }
        
        // Leer el archivo en memoria
        const imageBuffer = fs.readFileSync(file.path);
        
        // Procesar la imagen en memoria
        const optimizedBuffer = await sharp(imageBuffer)
            .resize(config.width, config.height, {
                fit: 'inside',
                position: 'center',
                withoutEnlargement: true
            })
            .jpeg({ quality: config.quality, progressive: true })
            .toBuffer();
        
        // Escribir el buffer optimizado al archivo original
        fs.writeFileSync(file.path, optimizedBuffer);
        
        console.log(`✅ Imagen optimizada: ${file.filename}`);
        return true;
    } catch (error) {
        console.error('❌ Error optimizando imagen:', error);
        return false;
    }
};

export const eliminarImagen = (filename, tipo = 'publicaciones') => {
    try {
        
        if (!filename) {
            console.log('⚠️ No se proporcionó nombre de archivo para eliminar');
            return false;
        }
        
        const directorio = DIRECTORIOS[tipo];
        if (!directorio) {
            console.error(`❌ Directorio no encontrado para tipo: ${tipo}`);
            return false;
        }
        
        let nombreArchivo = filename;
        if (filename.includes('/')) {
            nombreArchivo = filename.split('/').pop();
        }
        
        // Limpiar el nombre si tiene opt_ al inicio
        if (nombreArchivo.startsWith('opt_')) {
            nombreArchivo = nombreArchivo.substring(4);
            console.log(`📝 Limpiando nombre de archivo: ${filename} -> ${nombreArchivo}`);
        }
        
        const filePath = path.join(directorio, nombreArchivo);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Imagen eliminada: ${nombreArchivo}`);
            return true;
        } else {
            console.log(`⚠️ Imagen no encontrada: ${filePath}`);
            return false;
        }
    } catch (error) {
        console.error('❌ Error eliminando imagen:', error);
        return false;
    }
};
// Optimizar múltiples imágenes
export const optimizarMultiplesImagenes = async (files, tipo = 'publicaciones') => {
    const results = [];
    for (const file of files) {
        const success = await optimizarImagen(file, tipo);
        results.push({ filename: file.filename, success });
    }
    return results;
};


// Eliminar múltiples imágenes
export const eliminarMultiplesImagenes = async (filenames, tipo = 'publicaciones') => {
    const results = [];
    for (const filename of filenames) {
        const result = eliminarImagen(filename, tipo);
        results.push({ filename, deleted: result });
    }
    return results;
};