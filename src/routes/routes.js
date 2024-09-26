import { createRouter, createWebHashHistory } from "vue-router";
import documentos from "../components/documentos.vue"

const routes=[
    {path:"/", component: documentos,}
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
})