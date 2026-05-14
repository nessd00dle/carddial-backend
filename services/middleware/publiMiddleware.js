// Validar datos de publicación
export const validarPublicacion = (req, res, next) => {
    const { Titulo, Tipo, Franquicia } = req.body;
    
    const errores = [];
    
    if (!Titulo || Titulo.trim() === '') {
        errores.push('El título es obligatorio');
    }
    
    if (Titulo && Titulo.length > 100) {
        errores.push('El título no puede exceder los 100 caracteres');
    }
    
    if (!Tipo || !['venta', 'intercambio', 'coleccion'].includes(Tipo)) {
        errores.push('Tipo de publicación inválido');
    }
    
    if (!Franquicia) {
        errores.push('La franquicia es obligatoria');
    }
    
    if (errores.length > 0) {
        return res.status(400).json({
            success: false,
            errores
        });
    }
    
    next();
};

// Sanitizar datos de publicación
export const sanitizarPublicacion = (req, res, next) => {
    if (req.body.Titulo) {
        req.body.Titulo = req.body.Titulo.trim().replace(/[<>]/g, '');
    }
    
    if (req.body.Texto) {
        req.body.Texto = req.body.Texto.trim().replace(/[<>]/g, '');
    }
    
    if (req.body.Monto) {
        req.body.Monto = parseFloat(req.body.Monto);
        if (isNaN(req.body.Monto)) {
            delete req.body.Monto;
        }
    }
    
    if (req.body.Cantidad) {
        req.body.Cantidad = parseInt(req.body.Cantidad);
        if (isNaN(req.body.Cantidad)) {
            req.body.Cantidad = 1;
        }
    }
    
    if (req.body.CartasColeccion && typeof req.body.CartasColeccion === 'string') {
        try {
            req.body.CartasColeccion = JSON.parse(req.body.CartasColeccion);
        } catch (e) {
            req.body.CartasColeccion = [];
        }
    }
    
    next();
};

// Validar comentarios
export const validarComentario = (req, res, next) => {
    const { texto } = req.body;
    
    if (!texto || texto.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'El comentario no puede estar vacío'
        });
    }
    
    if (texto.length > 200) {
        return res.status(400).json({
            success: false,
            message: 'El comentario no puede exceder los 200 caracteres'
        });
    }
    
    req.body.texto = texto.trim().replace(/[<>]/g, '');
    next();
};