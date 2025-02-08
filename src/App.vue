<script setup>
import {shallowRef, provide, ref, computed, watch} from "vue";
import {useRouter, useRoute} from "vue-router";
import {storeToRefs} from "pinia";
import layouts from "@/components/layouts/index.js";
import {usePrimeVue} from "primevue/config";
import browserStorage from "@/lib/browser-storage.js";
import {useAuthStore} from "@/stores/auth.store";

const route = useRoute();
const router = useRouter();
const PrimeVue = usePrimeVue();

let initialThemeMode = browserStorage.get("themeMode") || window.document.body.getAttribute('data-theme-mode');
initialThemeMode = /^(dark)|(light)$/.test(initialThemeMode) ? initialThemeMode : 'light';

const layout = shallowRef('div');
const themeMode = ref(initialThemeMode);
const isDarkMode = ref(themeMode.value === 'dark');
const isUpdatingThemeMode = ref(false);

const authStore = useAuthStore();
const {isAuthenticated} = storeToRefs(authStore);

const setLayout = (layoutName) => {
	layout.value = layouts[layoutName] || 'div';
};

const toggleThemeMode = async () => {
	if (isUpdatingThemeMode.value) return;
	const themeLinkId = 'theme-link';
	const themeLink = window.document.getElementById(themeLinkId);

	if (themeLink) {
		const regexResult = /.+-(light|dark)-.+\/theme(\.min)?\.css/i.exec(themeLink.getAttribute('href'));

		if (!!regexResult && !!regexResult[1]) {
			const currentThemeMode = regexResult[1];
			const newThemeMode = (currentThemeMode === 'dark') ? 'light' : 'dark';

			isUpdatingThemeMode.value = true;
			const currentThemeName = `aura-${currentThemeMode}-blue`
			const newThemeName = `aura-${newThemeMode}-blue`;

			PrimeVue.changeTheme(
					currentThemeName,
					newThemeName,
					themeLinkId,
					() => {
						window.document.body.setAttribute('data-theme-mode', newThemeMode);
						browserStorage.set('themeMode', newThemeMode);

						themeMode.value = newThemeMode;
						isDarkMode.value = (newThemeMode === 'dark');
						isUpdatingThemeMode.value = false;
					});
		}
	}
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
