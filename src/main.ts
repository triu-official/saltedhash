import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './style.css'
import { client } from './lib/appwrite'
import { vRipple } from './utils/ripple'

const app = createApp(App)

app.use(createPinia())
app.directive('ripple', vRipple)
app.use(router)

app.mount('#app')

client.ping()
