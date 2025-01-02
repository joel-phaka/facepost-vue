<script setup>
import ImageGridView from "@/components/image/ImageGridView.vue";
import {onMounted, onUnmounted, ref, toRefs, watch} from "vue";

const props = defineProps({
	visible: {
		type: Boolean,
		default: false
	},
	images: {
		type: Array,
		default: []
	},
	showItemCaption: {
		type: Boolean,
		default: false
	},
	showPreviewCaption: {
		type: Boolean,
		default: false
	},
	showMoreItemsIndicator: {
		type: Boolean,
		default: false
	},
	expectedImagesCount: {
		type: Number,
		default: 0,
		validator: (value) => value >= 0
	}
});

const emit = defineEmits(["update:visible", "click"]);

const {
	visible,
	images,
	showItemCaption,
	showPreviewCaption,
	showMoreItemsIndicator,
	expectedImagesCount
} = toRefs(props);

const localVisible = ref(visible.value);
const isPreviewVisible = ref(false);

// Watch for changes in the prop and sync the local variable
watch(() => visible.value, (newValue) => {
	localVisible.value = newValue;
});

// Watch for changes in the local variable and emit the event to update the parent
watch(localVisible, (newValue) => {
	emit('update:visible', newValue);
});

const handleWindowKeyDown = (e) => {
	if (localVisible.value) {
		if (e.code === 'Escape' && !isPreviewVisible.value) {
			localVisible.value = false;
		}
	}
};

onMounted(() => {
	window.addEventListener('keydown', handleWindowKeyDown);
});

onUnmounted(() => {
	window.removeEventListener('keydown', handleWindowKeyDown);
});
</script>

<template>
	<Dialog
		v-model:visible="localVisible"
		:close-on-escape="false"
		modal
		:pt="{
			root: {
				style: {'border-radius': '0'}
			},
			header: {
				class: ['relative'],
				style: {'padding': '0', 'padding-top': '10px'}
			},
			icons: {
				class: ['absolute', 'border-circle'],
				style: {'top': '-18px', 'right': '-18px', /*'background-color': 'var(--surface-100)'*/}
			},
			closebutton: {
				class: ['outline-none'],
				style: {'width': '2rem', 'height': '2rem', 'z-index': '1', 'background-color': 'var(--surface-100)'},
			},
			content: {
				style: {'padding': '0 10px 10px 10px'}
			}
		}">
		<ImageGridView
			:images="images"
			:show-preview-caption="showPreviewCaption"
			:show-item-caption="showItemCaption"
			:expected-images-count="expectedImagesCount"
			:show-more-items-indicator="showMoreItemsIndicator"
			@preview-show="isPreviewVisible = true"
			@preview-hide="isPreviewVisible = false"/>
	</Dialog>
</template>

<style scoped>

</style>