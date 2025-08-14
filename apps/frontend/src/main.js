import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
app.config.devtools = true   // pastikan devtools on (dev only)

app.use(createPinia())       // aktifkan Pinia agar terlihat di DevTools
app.mount('#app')

// berguna untuk debugging manual di console
// @ts-ignore
window.__APP__ = app
