<script setup>
import {computed, onMounted, onUnmounted, ref, toRefs, watch} from "vue";

const props = defineProps({
	visible: {
		type: Boolean,
		default: false
	},
	activeIndex: {
		type: Number,
		default: 0
	},
	images: {
		type: Array,
		default: []
	},
	showCaption: {
		type: Boolean,
		default: false
	}
});

const emit = defineEmits([
	"update:visible",
	"update:activeIndex",
	"hide"
]);

const minZoomRatio = 0.4;
const maxZoomRatio = 2.0;

const {
	visible,
	activeIndex,
	images,
	showCaption,
} = toRefs(props);
const localVisible = ref(visible.value);
const localActiveIndex = ref(activeIndex.value);
const zoomRatio = ref(1.0);
const rotationAngle = ref(0);
const touchStartX = ref(0);
const touchEndX = ref(0);
const isReady = ref(false);
const isPreviewImageLoaded = ref(false);
const isBackdropImageLoaded = ref(false);
const hasPreviewImageError = ref(false);
const hasBackdropImageError = ref(false);

const activeImage = computed(() => images.value[localActiveIndex.value] ?? null);
const showDialog = computed({
	get: () => localVisible.value && !!images.value.length,
	set: (newValue) => {
		localVisible.value = newValue;
	}
});
const backdropStyle = computed(() => {
	let s = { backdropFilter: 'none' };

	if (zoomRatio.value !== 1.0 || (rotationAngle.value !== 0 && Math.abs(rotationAngle.value) % 360 !== 0)) {
		s.backdropFilter = "blur(13px)"
	}

	return s;
});

const isLoaded = computed(() => {
	return isPreviewImageLoaded.value && isBackdropImageLoaded.value
});

const hasError = computed(() => {
	return hasPreviewImageError.value || hasBackdropImageError.value;
});

watch(() => visible.value, (newValue) => {
	localVisible.value = newValue;
});

watch(() => activeIndex.value, (newValue) => {
	localActiveIndex.value = newValue;
});

watch(() => localVisible.value, (newValue) => {
	emit('update:visible', newValue);
});

watch(() => localActiveIndex.value, (newValue) => {
	emit('update:activeIndex', newValue);
});

watch(() => isLoaded.value, (newValue) => {
	if (newValue && !isReady.value) {
		isReady.value = true;
	}
});

const rotatePreview = (direction = "clockwise") => {
	if (!['clockwise', 'anti-clockwise'].includes(direction)) return;

	// Adjust the angle based on the direction
	rotationAngle.value = (rotationAngle.value + (direction === 'clockwise' ? 90 : -90)) % 360;

	// Ensure angle is positive (wraps negative values correctly)
	if (rotationAngle.value < 0) rotationAngle.value += 360;
};

const zoomPreview = (direction = "in") => {
	if (!direction || !['in', 'out'].includes(direction)) return;

	if (direction === 'out') {
		if (zoomRatio.value <= minZoomRatio) return;
		zoomRatio.value = parseFloat((zoomRatio.value - 0.1).toFixed(1));
	} else {
		if (zoomRatio.value >= maxZoomRatio) return;
		zoomRatio.value = parseFloat((zoomRatio.value + 0.1).toFixed(1));
	}
};

const resetReadiness = () => {
	isPreviewImageLoaded.value = false;
	isBackdropImageLoaded.value = false;
	hasPreviewImageError.value = false;
	hasBackdropImageError.value = false;
};

const resetPreview = (resetIndex = true) => {
	resetReadiness();
	resetTransformations();

	if (resetIndex) {
		localActiveIndex.value = 0;
	}
};

const resetTransformations = () => {
	zoomRatio.value = 1.0;
	rotationAngle.value = 0;
};

const handleNavigation = (direction) => {
	if (!['previous', 'next'].includes(direction)) return;

	resetPreview(false)

	localActiveIndex.value = (direction === 'next')
		? (localActiveIndex.value + 1) % images.value.length
		: (localActiveIndex.value === 0 ? (images.value.length - 1) : (localActiveIndex.value - 1));
};

const handlePreviewImageLoad = () => {
	isPreviewImageLoaded.value = true;
};

const handlePreviewImageError = () => {
	hasPreviewImageError.value = true;
};

const handleBackdropImageLoad = () => {
	isBackdropImageLoaded.value = true;
};

const handleBackdropImageError = () => {
	hasBackdropImageError.value = true;
};

const handleWindowKeyDown = (e) => {
	if (!showDialog.value) return;

	if (['ArrowLeft', 'ArrowRight'].includes(e.code)) {
		handleNavigation('ArrowLeft' ? 'previous' : 'next');
	} else if (e.code === 'Escape') {
		resetPreview();
		showDialog.value = false;
	}
};

const handleSwipe = () => {
	if (touchEndX.value < touchStartX.value) {
		handleNavigation('previous');
	} else if (touchEndX.value > touchStartX.value) {
		handleNavigation('next');
	}
};

const handlePreviewTouchStart = (e) => {
	if (showDialog.value && !!e.touches[0]) {
		touchStartX.value = e.touches[0].clientX;
	}
};

const handlePreviewTouchEnd = (e) => {
	if (!!e.changedTouches[0]) {
		touchEndX.value = e.changedTouches[0].clientX;
		handleSwipe();
	}
};

const handleDialogHide = () => {
	emit('hide');
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
		v-model:visible="showDialog"
		:close-on-escape="false"
		modal
		class="image-preview-dialog"
		@hide="handleDialogHide"
		:pt="{
			mask: {
				class: ['image-preview-dialog-mask', 'block'],
				style: {'--maskbg': 'rgba(0, 0, 0, 0.8)'}
			},
			root: {
				class: ['block', 'h-full', 'relative'],
				style: {'border-radius': '0', 'background-color': 'transparent', 'border': 'none', 'max-height': '100%'}
			},
		}">
		<template #container="{ closeCallback  }">
			<div
				class="image-preview-dialog-toolbar center-horizontal">
				<Button
					icon="pi pi-refresh"
					severity="contrast"
					text
					aria-label="Rotate Clockwise"
					:disabled="!isLoaded"
					@click="rotatePreview('clockwise')"/>
				<Button
					icon="pi pi-replay"
					severity="contrast"
					text
					aria-label="Rotate Anti-clockwise"
					:disabled="!isLoaded"
					@click="rotatePreview('anti-clockwise')"/>
				<Button
					icon="pi pi-search-minus"
					severity="contrast"
					text
					aria-label="Zoom Out"
					:disabled="!isLoaded || zoomRatio <= minZoomRatio"
					@click="zoomPreview('out')"/>
				<Button
					icon="pi pi-search-plus"
					severity="contrast"
					text
					aria-label="Zoom In"
					:disabled="!isLoaded || zoomRatio >= maxZoomRatio"
					@click="zoomPreview('in')"/>
				<Button
					icon="pi pi-times"
					severity="contrast"
					text
					aria-label="Close"
					@click="() => {
						resetPreview();
						closeCallback();
					}"/>
			</div>
			<div
				class="flex align-items-center justify-content-center w-full h-full relative"
				@touchstart="handlePreviewTouchStart($event)"
				@touchend="handlePreviewTouchEnd($event)"
				>
				<div class="image-preview-dialog-container">
					<img
						:src="activeImage?.url"
						:alt="activeImage?.caption"
						class="image-preview-dialog-image absolute center-vertical-horizontal select-none"
						:style="{
							'transform': `translate(-50%, -50%) rotate(${rotationAngle}deg) scale(${zoomRatio})`,
							'z-index': '2',
							'visibility': (isLoaded ? 'visible' : 'hidden')
						}"
						@load="handlePreviewImageLoad"
						@error="handlePreviewImageError"/>
					<img
						:src="activeImage?.url"
						:alt="activeImage?.caption"
						class="image-preview-dialog-backdrop-image select-none"
						:style="{
							'visibility': (isLoaded ? 'visible' : 'hidden')
						}"
						@load="handleBackdropImageLoad"
						@error="handleBackdropImageError"/>
					<div
						class="image-preview-dialog-backdrop"
						style="z-index: 1"
						:style="backdropStyle">
					</div>
					<div
						v-if="isLoaded && showCaption"
						class="image-preview-dialog-image-caption bg-gray-900 text-white text-center opacity-60"
						style="z-index: 3">
						{{ activeImage?.caption || '&nbsp;' }}
					</div>
					<ProgressSpinner
						v-if="!isLoaded && !hasError"
						strokeWidth="4"
						class="absolute center-vertical-horizontal"
						style="width: 48px; height: 48px;"/>
					<div
						v-if="hasError"
						class="text-center">
						Failed to load image
					</div>
				</div>
				<Button
					v-if="isReady && images.length > 1"
					class="navigation-button navigation-button-previous center-vertical"
					icon="pi pi-chevron-left"
					rounded
					@click="handleNavigation('previous')"/>
				<Button
					v-if="isReady && images.length > 1"
					class="navigation-button navigation-button-next center-vertical"
					icon="pi pi-chevron-right"
					rounded
					@click="handleNavigation('next')"/>
			</div>
		</template>
	</Dialog>
</template>

<style scoped>
.image-preview-dialog-container {
	max-height: 70vh;
	position: relative;
}
.image-preview-dialog-backdrop {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
}
img.image-preview-dialog-image {
	max-width: 100%;
	max-height: 100vh;
	display: block
}
img.image-preview-dialog-backdrop-image {
	max-width: 100%;
	max-height: inherit;
	display: block
}
.image-preview-dialog-image-caption {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 8px 10px;
	font-size: 14px;
}
.image-preview-dialog-toolbar {
	position: absolute;
	top: 15px;
	right: 15px;
	/*padding: 4px;*/
	display: flex;
	z-index: 3;
	gap: 0.5rem;
	background-color: rgba(39, 39, 42, .5);
	width: max-content;
}
.image-preview-dialog-toolbar > button {
	display: flex;
	align-items: center;
	justify-content: center;
	color: #d2d2dc;
	background-color: transparent;
	width: 2.75rem;
	height: 2.75rem;
	border-radius: 0;
	transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s, outline-color 0.2s;
	border: solid transparent 2px
}
.image-preview-dialog-toolbar > button .pi {
	font-size: 1.5rem !important;
}
.image-preview-dialog-toolbar > button:hover,
.image-preview-dialog-toolbar > button:focus-visible {
	color: black;
	background-color: white;
	outline: none;
}
.navigation-button {
	z-index: 3;
	background: rgba(255, 255, 255, 0.1);
	border: solid white 2px;
	border-radius: 50%;
	color: white;
	width: 36px;
	height: 36px;
	padding: 8px;
	position: absolute;
}
.navigation-button:hover {
	background: rgba(0, 0, 0, 0.5);
}
.navigation-button-previous {
	left: 15px;
}
.navigation-button-next {
	right: 15px;
}

@media screen and (min-width: 768px) {
	.image-preview-dialog-container {
		max-height: 80vh;
	}
	.image-preview-dialog-toolbar > button .pi {
		font-size: 1.0rem !important;
	}
}
</style>