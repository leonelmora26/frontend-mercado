import mongoose from 'mongoose'
const Schema = mongoose.Schema

const lugar = new mongoose.Schema({
    codigo:{type: Number, required: true, unique: true},
    origen: {type: String, required: true},
    destino: {type: String, required: true},
    horasalida: {type: Date, required: true},
    tarifa: {type: Number, required: true},
    createdAt: {type: Date, required: true, default: Date.now()},
    estado: {type: Number, default: 1} //0: inactivo 1: activo
})

export default mongoose.model('lugar', lugar)