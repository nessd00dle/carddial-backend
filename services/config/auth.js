import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Clave secreta desde variables de entorno, la neta no se si esta bien poner un valor por defecto, pero bueno, para desarrollo puede servir
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_por_defecto_para_desarrollo';

export const generarToken = (usuario) => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET no está configurado');
    }
    
    return jwt.sign(
        { 
            id: usuario._id, 
            correo: usuario.correo,
            nickname: usuario.nickname 
        }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
    );
};

export const verificarToken = (token) => {
    try {
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET no está configurado');
        }
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('Error verificando token:', error.message);
        return null;
    }
};