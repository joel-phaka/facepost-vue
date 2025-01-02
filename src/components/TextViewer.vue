<script setup lang="jsx">
import {computed, ref, toRefs} from "vue";

const props = defineProps({
	text: String,
	toggleable: {
		type: Boolean,
		default: false
	},
	toggleableMaxLength: {
		type: Number,
		default: 60
	}
});

const {text, toggleable, toggleableMaxLength} = toRefs(props);
const canToggleText = computed(() => toggleable.value && text.value?.trim().length && text.value.trim().length !== toggleableMaxLength.value);
const viewerText = ref(!canToggleText.value ? text.value : text.value.slice(0, toggleableMaxLength.value).trim());

const handleToggleClick = () => {
	if (viewerText.value === text.value) {
		viewerText.value = text.value.slice(0, toggleableMaxLength.value).trim();
	} else {
		viewerText.value = text.value;
	}
};
</script>

<template>
	<pre v-if="text">{{ viewerText }}<template v-if="canToggleText">...&nbsp;<span @click="handleToggleClick" class="cursor-pointer bg-transparent font-bold">{{ viewerText.length === text.length ? 'See less' : 'See more' }}</span></template></pre>
</template>

<style scoped>
	pre {
		font-family: inherit;
		white-space: pre-line;
	}
</style>