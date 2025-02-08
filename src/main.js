import { createApp } from 'vue';
import PrimeVue from "primevue/config";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import {createPinia} from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import VueObserveVisibility from 'vue3-observe-visibility'
import Aura from '@primevue/themes/aura';
import router from "@/router/index.js";

import './style.css';
import App from './App.vue';
import {definePreset} from "@primevue/themes";

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);

const PresetTheme = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        }
    }
});

app.use(PrimeVue, {
    theme: {
        preset: PresetTheme,
        options: {
            darkModeSelector: '.dark-mode',
        }
    }
});

app.use(VueObserveVisibility);

app.use(router);

app.mount('#app');
