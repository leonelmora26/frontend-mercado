import mongoose from 'mongoose'
const Schema = mongoose.Schema

const bus = new mongoose.Schema({
    puesto: {type: Number, required: true},
    placa: {type: String, required: true, unique: true},
    codigo: {type: String, required: true, unique: true},
    createdAt: {type: Date, required: true, default: Date.now()},
    estado: {type: Number, required:true, default: 1} //0: inactivo 1: activo
})

export default mongoose.model('bus', bus)
//moongose.schema.types.objectid,ref: ''