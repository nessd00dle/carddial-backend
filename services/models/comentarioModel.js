import mongoose from "mongoose";

const comentarioSchema = new mongoose.Schema({
    idUsuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El ID del usuario es obligatorio']
    },
    idPublicacion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Publicacion',
        required: [true, 'El ID de la publicación es obligatorio']
    },
    idConjunto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conjunto',
        default: null
    },
    texto: {
        type: String,
        required: [true, 'El texto del comentario es obligatorio'],
        trim: true,
        maxlength: [100, 'El comentario no puede exceder los 100 caracteres'],
        minlength: [1, 'El comentario debe tener al menos 1 carácter']
    },
    meGusta: {
        type: Number,
        default: 0,
        min: 0
    },
    usuariosMeGusta: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }],
    respuestas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comentario'
    }],
    esRespuesta: {
        type: Boolean,
        default: false
    },
    comentarioPadre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comentario',
        default: null
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Índices
comentarioSchema.index({ idPublicacion: 1, createdAt: -1 });
comentarioSchema.index({ idUsuario: 1 });
comentarioSchema.index({ idConjunto: 1 });

// Método para dar/quitar like
comentarioSchema.methods.toggleLike = async function(usuarioId) {
    const index = this.usuariosMeGusta.indexOf(usuarioId);
    if (index === -1) {
        this.usuariosMeGusta.push(usuarioId);
        this.meGusta += 1;
    } else {
        this.usuariosMeGusta.splice(index, 1);
        this.meGusta -= 1;
    }
    return await this.save();
};

// Método para agregar respuesta
comentarioSchema.methods.agregarRespuesta = async function(respuestaId) {
    this.respuestas.push(respuestaId);
    return await this.save();
};

// Método para obtener comentarios de una publicación
comentarioSchema.statics.obtenerPorPublicacion = async function(idPublicacion, limite = 20, pagina = 1) {
    const skip = (pagina - 1) * limite;
    
    const comentarios = await this.find({ 
        idPublicacion, 
        esRespuesta: false,
        activo: true 
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limite)
        .populate('idUsuario', 'nombre nickname fotoPerfil')
        .populate('respuestas');
    
    const total = await this.countDocuments({ 
        idPublicacion, 
        esRespuesta: false,
        activo: true 
    });
    
    // Cargar respuestas
    for (let comentario of comentarios) {
        if (comentario.respuestas.length > 0) {
            await comentario.populate({
                path: 'respuestas',
                populate: {
                    path: 'idUsuario',
                    select: 'nombre nickname fotoPerfil'
                }
            });
        }
    }
    
    return {
        comentarios,
        paginacion: {
            total,
            pagina,
            totalPaginas: Math.ceil(total / limite)
        }
    };
};


comentarioSchema.set('toJSON', {
    transform: function(doc, ret) {
        delete ret.__v;
        delete ret.usuariosMeGusta;
        return ret;
    }
});

const Comentario = mongoose.model("Comentario", comentarioSchema);

export default Comentario;