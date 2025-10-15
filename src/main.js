import App from './App.vue'
import {createApp} from 'vue'
import {createPinia} from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import {router} from "./routes/routes.js"
import { Quasar, Notify } from 'quasar'
import axios from 'axios'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

// Establecer la baseURL desde .env
axios.defaults.baseURL = import.meta.env.VITE_API_URL

const app = createApp(App)
const pinia = createPinia()

app.use(Quasar, { plugins: { Notify } })
app.use(pinia)
pinia.use(createPersistedState({ storage: sessionStorage }))
app.use(router)
app.mount('#app')
