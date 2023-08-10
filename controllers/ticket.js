import ticket from "../models/ticket.js";

const httpticket = {
    getticket : async (req, res) => {
    const {} = req.body;
    try {
      const dato = new ticket({nombreUser, password})
      dato.save()
      res.json({dato})
    } catch (error) {
      res.status(400).json({ error });
    }
  },
};

export default httpticket;