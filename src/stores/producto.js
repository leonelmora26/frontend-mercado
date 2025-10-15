import { defineStore } from 'pinia';
import axios from 'axios'
import { ref } from 'vue';


export const useProductoStore = defineStore('producto', () => {
  const productos = ref([]);


  const obtenerproductos = async () => {
    try {
      let responseproducto = await axios.get('api/producto');
      productos.value = responseproducto.data.producto;
    } catch (error) {
      throw error;
    }
  };

  const guardarProductos = async (producto) => {
    try {
      const response = await axios.post('api/agregar', producto)
      productos.value.push(response.data) // añade el nuevo producto a la lista local
      return response.data
    } catch (error) {
      console.error("❌ Error al guardar producto:", error)
      throw error
    }
  }


  const deleteproducto = async (id) => {
    try {
      console.log("eliminar", id)
      let eliminar = await axios.delete('api/eliminar/codigo/:id', id);
      return eliminar
    } catch (error) {
      throw error;
    }
  }

  return {
    productos,
    obtenerproductos, deleteproducto, guardarProductos
  }
})
