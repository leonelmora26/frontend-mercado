import mongoose from 'mongoose'
const Schema = mongoose.Schema

const usuario = new mongoose.Schema({
    id:{type: Number, required: true, unique: true},
    nombreUser: {type: String, required: true, maxlength: 20},
    password: {type: String, minlength: 8},
    createdAt: {type: Date, required: true, default: Date.now()},
    estado: {type: Number, default: 1} //0: inactivo 1: activo
})

export default mongoose.model('usuario', usuario)