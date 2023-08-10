import { Router} from "express"
import { check } from "express-validator"
import httpBus from "../controllers/bus.js"

const router = new Router()

router.post("/postbus", [
    check("puesto", "El puesto es obligatorio").not().isEmpty(),
    check("placa", "La placa es obligatoria").not().isEmpty(),
    check("codigo", "El codigo es obligatorio").not().isEmpty(),
    check("createdAt", "La fecha de creación es obligatoria").not().isEmpty(),
    check("estado", "El estado es obligatorio").not().isEmpty()
], httpBus.postBus)

router.get("/getbus/:codigo",[], httpBus.getBus)

router.put("/putbus/:codigo", [

], httpBus.putBus)

router.delete("/delbus/:codigo", httpBus.delBus)

export default router