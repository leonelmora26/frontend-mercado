import lugar from "../models/lugar.js";

const httplugar = {
  postlugar: async (req, res) => {
    const {codigo,origen, destino, horasalida,tarifa} = req.body;
    try {
      const dato = new lugar({codigo,origen, destino, horasalida,tarifa})
      dato.save()
      res.json({dato})
    } catch (error) {
      res.status(400).json({ error });
    }
  },  
  getLugar: async (req, res) => {
    const {codigo} = req.params
    try {
      const Lugar = await lugar.find({codigo})
      res.json({Lugar})
    } catch (error) {
      res.status(400).json({error})
    }
  },

  putLugar: async (req, res) => {
    try {
      const {codigo} = req.params
      const {origen, destino,horasalida,tarifa} = req.body
      const Lugar = await lugar.findOneAndUpdate({codigo},{origen, destino,horasalida,tarifa},{new:true})
        res.json({Lugar})
    } catch (error) {
      res.status(400).json({error})
    }
  },

  delLugar: async (req,res) => {
    try {
      const {codigo} = req.params
      const Lugar = await lugar.findOneAndDelete({codigo})
      
      if (!Lugar){
        res.status(400).json({error: "No se registra el lugar"})
      }

      res.json({message: "Destino eliminado"})
    } catch (error) {
      res.status(400).json({error: "Error"})
    }
  }
};

export default httplugar;