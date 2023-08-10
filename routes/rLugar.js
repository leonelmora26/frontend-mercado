import { Router} from "express"
import { check } from "express-validator"
import httplugar from "../controllers/lugar.js"

const router = new Router

router.post("/lugar", [
    check("origen", "El lugar de salida es obligatorio").not().isEmpty(),
    check("destino", "El lugar de destino es obligatorio").not().isEmpty(),
    check("horaSalida", "La hora de salida es obligatoria").not().isEmpty(),
    check("tarifa", "La tarifa es obligatoria").not().isEmpty(),
    check("createdAt", "La fecha de creación es obligatoria").not().isEmpty(),
    check("estado", "El estado es obligatorio").not().isEmpty()
], httplugar.postlugar)

router.get("/getLugar/:codigo",[], httplugar.getLugar)

router.put("/putLugar/:codigo", [], httplugar.putLugar)

router.delete("/delLugar/:codigo",[], httplugar.delLugar)

export default router