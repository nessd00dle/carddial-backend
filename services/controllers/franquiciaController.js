import Franquicia from '../models/franquiciaModel.js';

// Obtener todas las franquicias
export const obtenerFranquicias = async (req, res) => {
    try {
        const franquicias = await Franquicia.find().sort({ nombre: 1 });

        res.json({
            success: true,
            franquicias
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Obtener franquicia por ID
export const obtenerFranquiciaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        const franquicia = await Franquicia.findById(id);
        
        if (!franquicia) {
            return res.status(404).json({ 
                success: false, 
                message: 'Franquicia no encontrada' 
            });
        }
        
        res.json({
            success: true,
            franquicia
        });
    } catch (error) {
        console.error('Error obteniendo franquicia:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Crear franquicia  se deja por si acaso pero las franquicias son fijas y se inicializan al arrancar el servidor
export const crearFranquicia = async (req, res) => {
    try {
        const { nombre, descripcion, logo } = req.body;
        
        // Verificar si ya existe
        const existe = await Franquicia.findOne({ nombre: nombre.toUpperCase() });
        if (existe) {
            return res.status(400).json({ 
                success: false, 
                message: 'La franquicia ya existe' 
            });
        }
        
        const franquicia = new Franquicia({
            nombre: nombre.toUpperCase(),
            descripcion,
            logo
        });
        
        await franquicia.save();
        
        res.status(201).json({
            success: true,
            message: 'Franquicia creada exitosamente',
            franquicia
        });
    } catch (error) {
        console.error('Error creando franquicia:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Actualizar franquicia  esta a lo mejor ni se usa poeque las franquicias son fijas pero por si acaso se deja el endpoint
export const actualizarFranquicia = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, logo, activo } = req.body;
        
        const franquicia = await Franquicia.findById(id);
        
        if (!franquicia) {
            return res.status(404).json({ 
                success: false, 
                message: 'Franquicia no encontrada' 
            });
        }
        
        if (nombre) franquicia.nombre = nombre.toUpperCase();
        if (descripcion !== undefined) franquicia.descripcion = descripcion;
        if (logo !== undefined) franquicia.logo = logo;
        if (activo !== undefined) franquicia.activo = activo;
        
        await franquicia.save();
        
        res.json({
            success: true,
            message: 'Franquicia actualizada exitosamente',
            franquicia
        });
    } catch (error) {
        console.error('Error actualizando franquicia:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};