<script setup>
import {ref, inject, provide} from "vue";

const isLayoutProcessing = ref(false);
const {toggleThemeMode, isDarkMode, isUpdatingThemeMode} = inject('app:theme');

provide('app:layout:auth:isLayoutProcessing', isLayoutProcessing);
provide('app:layout:auth:setLayoutProcessing', (v) => {
	isLayoutProcessing.value = v;
});
</script>

<template>
	<div class="main-container w-full h-full flex md:align-items-center md:justify-content-center relative">
		<div v-show="!isLayoutProcessing" class="form-container pt-5 pb-7 md:px-4 mx-3">
			<slot class=""></slot>
		</div>
		<div v-show="isLayoutProcessing" class="fixed center-vertical-horizontal surface-ground" style="width: max-content; border-radius: 50%">
			<ProgressSpinner strokeWidth="4"/>
		</div>
		<div class="backdrop-overlay absolute w-full h-full"></div>
		<Button v-if="!isUpdatingThemeMode"
		        @click="toggleThemeMode"
		        :icon="`pi pi-${isDarkMode ? 'sun' : 'moon'}`"
		        rounded
		        class="absolute surface-0 border-0"
		        :class="{'text-white': isDarkMode, 'text-black-alpha-90': !isDarkMode}"
		        :disabled="isUpdatingThemeMode"
		        :pt:icon:style="{'font-size': '26px'}"
		        style="top: 20px; right: 20px;"/>
		<div v-else
		     class="absolute surface-0 border-0 flex align-items-center justify-content-center bg-transparent"
		     style="width: 40px; height: 40px; top: 20px; right: 20px;">
			<ProgressSpinner strokeWidth="3" style="width: 30px; height: 30px"/>
		</div>
	</div>
</template>

<style>
.form-container {
	width: 100%;
	border-radius: 8px;
	height: max-content;
}
.backdrop-overlay {
	z-index: -1;
	filter: blur(200px);
	background-image: none;
}
.form-site-logo {
	width: 48px;
	height: 48px;

}
@media screen and (min-width: 768px){
	.form-container {
		background-color: var(--surface-0);
	}
	.form-container:has(> #signInForm) {
		width: 450px;
	}
	.form-container:has(> #signUpForm) {
		width: 600px;
	}
	.backdrop-overlay {
		background-image: url('@/assets/blur-backdrop.jpg');
	}
}
</style>