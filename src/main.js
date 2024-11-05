
// import './style.css'
import App from './App.vue'
import {createApp} from 'vue'
import {createPinia} from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import {router} from "./routes/routes.js"
import { Quasar, Notify } from 'quasar'
import axios from 'axios'


import '@quasar/extras/material-icons/material-icons.css'

import 'quasar/src/css/index.sass'

const app = createApp(App)
const pinia = createPinia()

app.use(Quasar, {
    plugins: {
        Notify,
    }
})

app.use(pinia)
pinia.use(createPersistedState({
    storage: sessionStorage,
  }))

app.use(router)

// axios.defaults.baseURL ="https://backendapi-lr8w.onrender.com"
// axios.defaults.baseURL = 'http://localhost:3001/'
app.mount('#app')
