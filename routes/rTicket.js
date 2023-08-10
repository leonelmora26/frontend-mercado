import { Router, Router } from "express"
import { check } from "express-validator"
import httpticket from "../controllers/ticket.js"

const router = new Router

router.get("/ticket", [
    check("cedula", "").not().isEmpty(),
    check("cedula", "la cedula debe contener minimo 8 caracteres").not().isEmpty().isLength({min:8}),
    check("cedula", "la cedula debe contener maximo 10 caracteres").not().isEmpty().isLength({max:10}),
    check("nombre", "maximo 15 caracteres").not().isEmpty().isLength({max:15}),
    check("celular", "es obligatorio el numero celular").not().isEmpty(),
    check("createdAt", "La fecha de creación es obligatoria").not().isEmpty(),
    check("estado", "El estado es obligatorio").not().isEmpty()
], httpticket.getticket)

export default router