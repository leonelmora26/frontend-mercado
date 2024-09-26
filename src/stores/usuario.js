import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';

export const useUsuarioStore = defineStore('usuario', () => {
  const usuarios = ref([]);
  const obtenerusuario = async () => {
    try {
      let responseusuario = await axios.get('usuario/all');
      console.log('Datos recibidos:', responseusuario.data.usuario); // Log para verificar los datos
      usuarios.value = responseusuario.data.usuario;
      return responseusuario.data.usuario;
    } catch (error) {
      console.error('Error al obtener usuarios:', error); // Log de error
      throw error;
    }
  };

  return {
    usuarios,
    obtenerusuario
  };
});
