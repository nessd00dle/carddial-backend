// Validar comentario
export const validarComentario = (req, res, next) => {
    const { texto } = req.body;
    
    const errores = [];
    
    if (!texto || texto.trim() === '') {
        errores.push('El comentario no puede estar vacío');
    }
    
    if (texto && texto.length > 500) {
        errores.push('El comentario no puede exceder los 500 caracteres');
    }
    
    if (errores.length > 0) {
        return res.status(400).json({
            success: false,
            errores
        });
    }
    
    req.body.texto = texto.trim().replace(/[<>]/g, '');
    next();
};