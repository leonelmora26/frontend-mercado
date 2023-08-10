import bus from "../models/bus.js";

const httpBus = {
  postBus: async (req, res) => {
    const { puesto, placa, codigo} = req.body;
    try {
      const dato = new bus({puesto, placa, codigo})
      dato.save()

      res.json({dato})
    } catch (error) {
      res.status(400).json({ error });
    }
  },

  getBus: async (req, res) => {
    const {codigo} = req.params
    try {
      const Bus = await bus.find({codigo})
      res.json({Bus})
    } catch (error) {
      res.status(400).json({error})
    }
  },

  putBus: async (req, res) => {
    try {
      const {codigo} = req.params
      const {puesto, placa} = req.body
      const Bus = await bus.findOneAndUpdate({codigo},{puesto, placa},{new:true})
        res.json({Bus})
    } catch (error) {
      res.status(400).json({error})
    }
  },

  delBus: async (req,res) => {
    try {
      const {codigo} = req.params
      const Bus = await bus.findOneAndDelete({codigo})
      
      if (!Bus){
        res.status(400).json({error: "No se encontro el Bus"})
      }

      res.json({message: "Se ha eliminado el Bus"})
    } catch (error) {
      res.status(400).json({error: "Error"})
    }
  }

};

export default httpBus;
