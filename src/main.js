import { createApp } from 'vue';
import PrimeVue from "primevue/config";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import {createPinia} from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import VueObserveVisibility from 'vue3-observe-visibility'
import router from "@/router/index.js";

import './style.css';
import App from './App.vue';

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(PrimeVue);
app.use(VueObserveVisibility)
app.use(router);

app.mount('#app');
