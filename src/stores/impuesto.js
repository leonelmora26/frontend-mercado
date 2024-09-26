import { defineStore } from 'pinia';
import axios from 'axios'
import {ref} from 'vue';


export const useImpuestoStore = defineStore('impuesto', () => {
    const impuesto = ref([]);
    const obtenerusuario = async () => {
      try {
        let responseimpuesto = await axios.get('impuesto/all');
        impuesto.value = responseimpuesto.data.impuesto;
        return responseimpuesto.data.impuesto
      } catch (error) {
        throw error;
      }
    };

return {
    impuesto,
    obtenerusuario
}
})
