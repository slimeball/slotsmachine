import { createApp } from 'vue'
import App from './App.vue'
import Toaster from "@meforma/vue-toaster";
createApp(App).use(Toaster, {
  position: "top",
}).mount('#app')