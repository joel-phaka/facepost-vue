<script setup>
import {ref} from "vue";

const props = defineProps({
	asyncFunction: {
		type: Function,
		required: true
	}
});

const {asyncFunction} = props;

const emit = defineEmits(['success', 'fail', 'complete']);

const success = ref(false);
const result = ref();
const error = ref();

try {
	result.value = await asyncFunction();
	success.value = true;

	emit('success', result.value);
} catch (e) {
	error.value = e;

	emit("fail", e);
} finally {
	emit("complete", {
		success: success.value,
		result: result.value,
		error: error.value
	});
}
</script>

<template>

</template>

<style scoped>

</style>