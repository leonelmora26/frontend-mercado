import usuario from "../models/usuario.js";
import bcryptjs from "bcrypt"

const httpUsuario = {
  postusuario : async (req, res) => {
    const {id, nombreUser, password} = req.body;
    try {
      const dato = new usuario({id,nombreUser, password})
      const salt = bcryptjs.genSaltSync();
      dato.password = bcryptjs.hashSync(password, salt)
      dato.save()
      res.json({dato})
    } catch (error) {
      res.status(400).json({ error });
    } 
  },
  
  cargarArchivoCloud: async (req, res) => {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_KEY,
            api_secret: process.env.CLOUDINARY_SECRET,
            secure: true
        });

        const { id } = req.params;
        try {
            //subir archivo
            const { tempFilePath } = req.files.archivo
            cloudinary.uploader.upload(tempFilePath,
                { width: 250, crop: "limit" },
                async function (error, result) {
                    if (result) {
                        let holder = await Holder.findById(id);
                        if (holder.photo) {
                            const nombreTemp = holder.photo.split('/')
                            const nombreArchivo = nombreTemp[nombreTemp.length - 1] // hgbkoyinhx9ahaqmpcwl jpg
                            const [public_id] = nombreArchivo.split('.')
                            cloudinary.uploader.destroy(public_id)
                        }
                        holder = await Holder.findByIdAndUpdate(id, { photo: result.url })
                        //responder
                        res.json({ url: result.url });
                    } else {
                        res.json(error)
                    }

                })
        } catch (error) {
            res.status(400).json({ error, 'general': 'Controlador' })
        }
    },  

    getUsuario: async (req, res) => {
        const {id} = req.params
        try {
          const Usuario = await usuario.find({id})
          res.json({Usuario})
        } catch (error) {
          res.status(400).json({error})
        }
      },
    
      putUsuario: async (req, res) => {
        try {
          const {id} = req.params
          const {nombreUser, password} = req.body
          const Usuario = await usuario.findOneAndUpdate({id},{nombreUser, password},{new:true})
            res.json({Usuario})
        } catch (error) {
          res.status(400).json({error})
        }
      },
    
      delUsuario: async (req,res) => {
        try {
          const {id} = req.params
          const Usuario = await usuario.findOneAndDelete({id})
          
          if (!Usuario){
            res.status(400).json({error: "No se registra el usuario"})
          }
    
          res.json({message: "Usuario eliminado"})
        } catch (error) {
          res.status(400).json({error: "Error"})
        }
      }
    }

export default httpUsuario;