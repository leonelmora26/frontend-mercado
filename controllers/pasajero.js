import pasajero from "../models/pasajero.js";

const httpPersona = {
  postpasajero : async (req, res) => {
    const {cedula, nombre, celular} = req.body;
    try {
      const dato = new pasajero({cedula, nombre, celular})
      dato.save()
      res.json({dato})
    } catch (error) {
      res.status(400).json({ error });
    }
  },

  getPasajero : async (req, res) => {
    try {
      const Pasajero = await pasajero.find()
      res.json({Pasajero})

    } catch (error) {
      res.status(400).json({error})
    }
  }

};

export default httpPersona;