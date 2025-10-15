import { createRouter, createWebHashHistory } from "vue-router";
import producto from "../components/producto.vue"
const routes=[
    {path:"/", component: producto,},
    // {path:"/", component: factura,}
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
})