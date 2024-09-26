import { defineStore } from 'pinia';
import axios from 'axios'
import {ref} from 'vue';


export const useProductoStore = defineStore('producto', () => {
    const productos = ref([]);
    const obtenerproductos = async () => {
      try {
        let responseproducto = await axios.get('producto/all');
        productosb.value = responseproducto.data.producto;
        return responseproducto.data.producto
      } catch (error) {
        throw error;
      }
    };

return {
    productos,
    obtenerproductos
}
})
