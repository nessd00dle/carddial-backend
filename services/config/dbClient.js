// config/dbClient.js
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(` MongoDB Connected: ${conn.connection.host}`);
        console.log(` Base de datos: ${conn.connection.name}`);
        console.log(` URI: ${process.env.MONGO_URI?.substring(0, 50)}...`);
    } catch (error) {
        console.error(' Error de conexión:', error.message);
        process.exit(1);
    }
};

export default connectDB;