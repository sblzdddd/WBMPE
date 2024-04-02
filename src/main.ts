import { createApp } from 'vue'
import './style.css'
import router from "./routes";
import App from './App.vue'
import CustomScrollbar from 'custom-vue-scrollbar';
import 'custom-vue-scrollbar/dist/style.css';

const app = createApp(App)

app.use(router)
app.component("custom-scrollbar", CustomScrollbar)

app.mount('#app')

