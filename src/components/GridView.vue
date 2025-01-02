<script setup>
import {computed, onMounted, onUnmounted, ref, toRefs, watch} from "vue";

const props = defineProps({
	items: {
		type: Array,
		default: []
	},
	showMoreItemsIndicator: {
		type: Boolean,
		default: false
	},
	maxRows: {
		type: Number,
		default: 0,
		validator: (value) => value >= 0
	}
});

const emit = defineEmits(['resize', 'click', 'more-items-click'])

const {items, maxRows, showMoreItemsIndicator} = toRefs(props);
const columns = ref(1);
const itemGap = ref(10);
const maxItemWidth = ref(350);
const containerElement = ref();
const isMounted = ref(false);

const calculateGridSize = () => {
	if (!containerElement.value || !isMounted.value) return;

	const widthMatch = getComputedStyle(containerElement.value).width.match(/(\d+(?:.\d+)?)/);

	if (!widthMatch || widthMatch.length < 2) return;

	const viewportWidth = Math.round(parseFloat(parseFloat(widthMatch[1]).toFixed(2)))

	let c = columns.value;

	if (viewportWidth > 0 && viewportWidth < 250) {
		c = 2;
	} else if (viewportWidth >= 250 && viewportWidth < 720) {
		c = 3;
	} else if (viewportWidth >= 720 && viewportWidth < 900) {
		c = 4;
	} else if (viewportWidth >= 900 && viewportWidth < 1080) {
		c = 5;
	} else if (viewportWidth >= 1080 && viewportWidth < 1440) {
		c = 6;
	} else if (viewportWidth >= 1440 && viewportWidth < 2000) {
		c = 8;
	} else if (viewportWidth >= 2000) {
		if ((viewportWidth / 350) >= 10) c = Math.round(viewportWidth / 350);
		else if ((viewportWidth / 300) >= 10) c = Math.round(viewportWidth / 300);
		else if ((viewportWidth / 250) >= 10) c = Math.round(viewportWidth / 250);
		else if ((viewportWidth / 200) >= 10) c = Math.round(viewportWidth / 200);
		else c = 10;
	}

	maxItemWidth.value = (viewportWidth - ((c - 1) * itemGap.value)) / c;
	columns.value = c;

	emit('resize', {width: viewportWidth, columns: columns.value})
};

const displayedItems = computed(() => {
	let maxItems = items.value.length;

	if (maxRows.value > 0 && (items.value.length / columns.value) >= maxRows.value) {
		maxItems = (columns.value * maxRows.value) - (showMoreItemsIndicator.value ? 1 : 0);
	}

	return items.value.slice(0, maxItems);
});

const handleWindowResize = () => {
	calculateGridSize()
};

watch(displayedItems, () => calculateGridSize());

onMounted(() => {
	isMounted.value = true;
	handleWindowResize();
	window.addEventListener('resize', handleWindowResize);
});

onUnmounted(() => {
	isMounted.value = false;
	window.removeEventListener('resize', handleWindowResize);
});

const handleItemClick = (item, index) => {
	emit('click', item, index)
};

const handleMoreItemsIndicatorClick = () => {
	emit('more-items-click')
};

const handleVisibility = (isVisible) => {
	if (isVisible) calculateGridSize();
};
</script>
<template>
	<div ref="containerElement"
	     class="grid-view"
	     :style="`grid-template-columns: repeat(${columns}, 1fr);`">
		<div
			v-observe-visibility="handleVisibility"
			class="absolute w-full"
			style="top: 0; z-index: 99999999999999999">
		</div>
		<div
			v-for="(item, index) of displayedItems"
			:key="index"
			class="grid-view-item"
			@click="handleItemClick(item, index)">
			<slot name="item" :item="item" :size="maxItemWidth"></slot>
		</div>
		<div
			v-if="showMoreItemsIndicator && !!items.length && displayedItems.length < items.length"
			@click="handleMoreItemsIndicatorClick"
			class="grid-view-item cursor-pointer">
			<slot
				name="more-items-indicator"
				:displayedItemsCount="displayedItems.length"
				:moreItemsCount="items.length - displayedItems.length"
				:nextItem="items[displayedItems.length]"
				:nextItemIndex="displayedItems.length">
				<div class="w-full h-full flex align-items-center justify-content-center bg-black-alpha-50">
					<h1 class="m-0">+{{ items.length - displayedItems.length }}</h1>
				</div>
			</slot>
		</div>
	</div>
</template>
<style scoped>
.grid-view {
	display: grid;
	gap: v-bind(itemGap + 'px');
}
.grid-view-item {
	position: relative;
	aspect-ratio: 1/1;
	max-width: v-bind(maxItemWidth + 'px');
	display: flex;

}
.image-grid-view-item > img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
</style>