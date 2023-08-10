import mongoose from 'mongoose'
const Schema = mongoose.Schema

const pasajero = new mongoose.Schema({
    cedula: {type: String, unique: true, required: true, minlength:8,maxlenght:10},
    nombre: {type: String, maxlength: 15, unique: true, required: true},
    celular: {type: String,required: true},
    createdAt: {type: Date, required: true, default: Date.now()},
    estado: {type: Number, default: 1} //0: inactivo 1: activo
})

export default mongoose.model('pasajero', pasajero)
   