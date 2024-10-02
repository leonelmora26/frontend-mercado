import { createRouter, createWebHashHistory } from "vue-router";
import documentos from "../components/documentos.vue"
import factura from "../components/factura.vue"
const routes=[
    {path:"/", component: documentos,},
    {path:"/factura", component: factura,}
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
})