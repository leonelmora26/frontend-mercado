import { createApp } from "vue";
import { router } from "./routes/routes.js";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import axios from "axios";
import { Quasar, Dialog, Notify } from "quasar";
import "@quasar/extras/material-icons/material-icons.css";
import 'quasar/src/css/variables.sass';
import App from "./App.vue";
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'

axios.defaults.baseURL = 'http://localhost:3010/api/'




const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)

const myApp = createApp(App);

myApp.use(Quasar, {
  plugins: { Dialog, Notify },
  config: {
    notify: {},
  },
});
 
myApp.use(pinia);
myApp.use(router);
myApp.use(FloatingVue);

myApp.mount("#app");