import { Router } from "express"
import { check } from "express-validator"
import httpUsuario from "../controllers/usuario.js"

const router = new Router()

router.post("/usuario", [
    check("nombreUser", "identificarce con cedula es obligatorio").not().isEmpty(),
    check("password", "la cedula debe contener minimo 8 caracteres").not().isEmpty().isLength({ min: 8 }),
    check("estado", "la cedula debe contener maximo 10 caracteres").not().isEmpty().isLength({ max: 10 }),
],httpUsuario.postusuario)
router.post("/usuarioo", httpUsuario.postusuario)

router.get("/getUsuario/:id", httpUsuario.getUsuario)

router.put("/putUsuario/:id", httpUsuario.putUsuario)

router.delete("/delUsuario/:id", httpUsuario.delUsuario)

export default router

// nombreUser
// password
// createdAt
// estado