import mongoose from "mongoose";

const franquiciaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    }
}, {
    timestamps: true
});

const Franquicia = mongoose.model("Franquicia", franquiciaSchema);

export default Franquicia;