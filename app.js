import express from "express";
import 'dotenv/config'
import bus from "./routes/rBus.js"
import mongoose from "mongoose";
import pasajero from "./routes/rPasajero.js";
import lugar from "./routes/rLugar.js";
import usuario from "./routes/rUsuario.js";

mongoose.connect(`${process.env.DB}`)
.then (() => console.log(`connected`));

const app = express()
app.use(express.json())
app.use(   "/api/bus"   ,  bus)
app.use(   "/api/pasajero", pasajero )
app.use(   "/api/lugar", lugar )
app.use(   "/api/usuario", usuario )



app.listen(process.env.PORT,()=>{
  console.log(`Servidor escuchando en el puerto ${process.env.PORT}`);
}) 