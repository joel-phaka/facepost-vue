<script setup>
import {toRefs, ref} from "vue";

const props = defineProps({
	user: {
		type: Object,
		required: true,
		validator: (value) => !!value?.id
	},
	size: {
		type: Number,
		default: 48,
		validator: (value) => value > 0
	}
});

const {user, width, height} = toRefs(props);
const emit = defineEmits(['click']);

const showAvatar = ref(false);

const handleClick = (e) => {
	emit('click', e, user.value);
};
const handleImageLoad = (e) => {
	showAvatar.value = false;
};
const handleImageError = (e) => {
	showAvatar.value = true;
};
</script>

<template>
	<div class="relative cursor-pointer" :style="{'width': `${size}px`, 'height': `${size}px`}" @click="handleClick">
		<Avatar
			v-if="!user.profile_picture || showAvatar"
			size="small"
			class="absolute flex align-items-center justify-content-center text-white w-full h-full"
			style="font-size: 14px; user-select:none; background-color:#009fff; font-weight: bolder;"
			:label="user?.initials"
			shape="circle"
			rounded />
		<img
			v-if="!!user.profile_picture"
			:src="user.profile_picture_base64 || user.profile_picture"
			:alt="`${user.first_name} ${user.last_name}`"
			class="absolute border-circle w-full h-full"
			style="display: block"
			@load="handleImageLoad"
			@error="handleImageError"/>
	</div>
</template>

<style scoped>

</style>