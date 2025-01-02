<script setup>
import NavBar from "@/components/layouts/partials/NavBar.vue";

</script>

<template>
	<NavBar/>
	<div class="app--main-container pl-3 pr-3 pb-4">
		<slot></slot>
	</div>
</template>

<style scoped>

</style>