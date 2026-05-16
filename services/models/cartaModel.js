import mongoose from "mongoose";

const cartaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la carta es obligatorio'],
        trim: true,
        maxlength: [200, 'El nombre no puede exceder los 200 caracteres']
    },
    idFranquicia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Franquicia',
        required: [true, 'La franquicia es obligatoria']
    },
    imagen: {
        type: String,
        required: [true, 'La imagen de la carta es obligatoria']
    },
    imagenPublicId: {
        type: String,  // Para Cloudinary
        default: null
    },
    descripcion: {
        type: String,
        trim: true,
        maxlength: [200, 'La descripción no puede exceder los 200 caracteres']
    },
    rareza: {
        type: String,
        enum: ['común', 'poco común', 'rara', 'muy rara', 'ultra rara', 'legendaria'],
        default: 'común'
    },
    numero: {
        type: Number,
        min: 0,
        comment: 'Número de la carta en la colección'
    },
    año: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear()
    },
    valorEstimado: {
        type: Number,
        min: 0,
        default: 0
    },
    activo: {
        type: Boolean,
        default: true
    },
    creadaPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }
}, {
    timestamps: true
});

// Índices
cartaSchema.index({ nombre: 'text' });
cartaSchema.index({ idFranquicia: 1, nombre: 1 });
cartaSchema.index({ rareza: 1 });
cartaSchema.index({ valorEstimado: -1 });


cartaSchema.virtual('imagenUrl').get(function () {
  if (!this.imagen) return null;

  if (this.imagen.startsWith('http')) return this.imagen;
  
  if (process.env.NODE_ENV !== 'production') {
    return `http://localhost:3000/uploads/cartas/${this.imagen}`;
  }
  return this.imagen;
});

// Método para obtener imagen optimizada
cartaSchema.methods.getImagenOptimizada = function(width = 300, height = 300) {
    const imagenUrl = this.imagenUrl;
    
    if (!imagenUrl) return null;
    
    // Si es Cloudinary, agregar transformaciones
    if (imagenUrl.includes('cloudinary.com')) {
        return imagenUrl.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto/`);
    }
    
    // Si es local, devolver la URL original
    return imagenUrl;
};

// Método estático para buscar cartas
cartaSchema.statics.buscarCartas = async function(termino, franquicia = null, limite = 20) {
    let query = { activo: true };
    
    if (termino && termino.trim()) {
        query.$text = { $search: termino };
    }
    
    if (franquicia) {
        query.idFranquicia = franquicia;
    }
    
    return await this.find(query)
        .populate('idFranquicia', 'nombre')
        .limit(limite)
        .sort({ createdAt: -1 });
};

// Método estático para obtener cartas por franquicia
cartaSchema.statics.obtenerPorFranquicia = async function(idFranquicia) {
    return await this.find({ idFranquicia, activo: true })
        .populate('idFranquicia', 'nombre')
        .sort({ nombre: 1 });
};

cartaSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.__v;
        delete ret.imagenPublicId; 
        return ret;
    }
});

const Carta = mongoose.model("Carta", cartaSchema);

export default Carta;