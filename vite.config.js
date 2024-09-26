import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar } from '@quasar/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    quasar(),
  ],
  css: {
    preprocessorOptions: {
      sass: {
        // Puedes agregar opciones aquí si es necesario
      },
    },
  },
});
