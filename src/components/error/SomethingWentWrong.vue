<script setup>
import {computed, toRefs} from "vue";
import {useRouter} from "vue-router";

const props = defineProps({
	message: {
		type: String,
	}
});

const router = useRouter();
const isOnHomePage = computed(() => router.currentRoute.value.path === '/');

const {message} = toRefs(props);

const handleReturnToHome = () => {
	isOnHomePage.value ? router.go(0) : router.push({path: '/'});
};
</script>

<template>
	<div class="absolute center-vertical-horizontal flex flex-column align-items-center bg-transparent" style="gap: 25px">
		<h4 class="m-0">
			{{ message || "Oops, something went wrong" }}
		</h4>
		<Button
			:label="isOnHomePage ? `Refresh` : `Return to home page`"
			severity="info"
			outlined
			raised
			@click="handleReturnToHome"/>
	</div>
</template>

<style scoped>

</style>