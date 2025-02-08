<script setup>
import {shallowRef, provide, ref, computed, watch} from "vue";
import {useRouter, useRoute} from "vue-router";
import {storeToRefs} from "pinia";
import layouts from "@/components/layouts/index.js";
import browserStorage from "@/lib/browser-storage.js";
import {useAuthStore} from "@/stores/auth.store";

const route = useRoute();
const router = useRouter();

const layout = shallowRef('div');
const themeMode = ref(['light', 'dark'].includes(browserStorage.get("themeMode")) ? browserStorage.get("themeMode") : 'light');
const isDarkMode = ref(themeMode.value === 'dark');
const isUpdatingThemeMode = ref(false);

const authStore = useAuthStore();
const {isAuthenticated} = storeToRefs(authStore);

const setLayout = (layoutName) => {
	layout.value = layouts[layoutName] || 'div';
};

const toggleThemeMode = async () => {
	if (isUpdatingThemeMode.value) return;

    isDarkMode.value = document.documentElement.classList.toggle('dark-mode');

    browserStorage.set('themeMode', isDarkMode.value ? 'dark' : 'light');

    isUpdatingThemeMode.value = false;
};

provide("app:setLayout", setLayout);
provide('app:theme', {
	themeMode: computed(() => themeMode.value),
	isDarkMode: computed(() => isDarkMode.value),
	isUpdatingThemeMode: computed(() => isUpdatingThemeMode.value),
	toggleThemeMode
})

router.afterEach((to) => {
	setLayout(to.meta.layout);

	if (to.meta.title) document.title = `${to.meta.title} / ${import.meta.env.VITE_APP_APP_NAME ?? 'Facepost'}`;
});

watch(
	() => isAuthenticated.value, 
	(value) => {
        let query = {};

        if (!/^\/(login)|(signin)|(logout)|(signout)/.test(route.fullPath)) {
            query.continue = route.fullPath;
        }

        if (!value) {
            router.replace({path: '/signin', query});
        }
    }
);

</script>

<template>
	<component :is="layout || 'div'" :key="$route.fullPath">
		<router-view :key="$route.fullPath"/>
	</component>
</template>

<style scoped>

</style>
