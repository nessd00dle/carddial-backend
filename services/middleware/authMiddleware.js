import { verificarToken } from "../config/auth.js";

export const autenticarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No hay token' });
    }

    const usuario = verificarToken(token);
    
    if (!usuario) {
        return res.status(403).json({ error: 'Token inválido o expirado' });
    }

    req.usuario = usuario; 
    next();
};