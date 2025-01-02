<script setup>
import {ref, toRefs, watch} from "vue";
import GridView from "@/components/GridView.vue";
import ImagePreviewDialog from "@/components/image/ImagePreviewDialog.vue";

const props = defineProps({
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
		default: 0
	},
	maxRows: {
		type: Number,
		default: 0
	}
});

const emit = defineEmits(["click", "more-images-click", 'preview-show', 'preview-hide']);

const {
	images,
	showItemCaption,
	showPreviewCaption,
	showMoreItemsIndicator,
	expectedImagesCount,
	maxRows
} = toRefs(props);
const activeIndex = ref(0)
const isPreviewVisible = ref(false);
const failedImages = ref([]);
const loadedImages = ref([]);

const handleImageClick = (item, index) => {
	if (!loadedImages.value.includes(item.id)) return;

	activeIndex.value = index;
	isPreviewVisible.value = true;
	emit('click', item, index);
};

const handleMoreItemsClick = () => {
	emit('more-images-click');
};

const handleItemImageLoad = (e, image) => {
	loadedImages.value.push(image.id);
};

const handleImageError = (e, image) => {
	failedImages.value.push(image.id);
};

watch(() => isPreviewVisible.value, (newValue) => {
	if (newValue) emit('preview-show');
	else emit('preview-hide');
});
</script>
<template>
	<div class="image-grid-view-wrapper w-full">
		<GridView
			v-if="!!expectedImagesCount && !images.length"
			:items="Array(expectedImagesCount).fill(0)"
			:max-rows="maxRows"
			class="image-grid-view">
			<template #item="{item}">
				<Skeleton size="100%" style="border-radius: 0"/>
			</template>
		</GridView>
		<ImagePreviewDialog
			:images="images"
			v-model:visible="isPreviewVisible"
			v-model:activeIndex="activeIndex"
			:show-caption="showPreviewCaption"/>
		<GridView
			:items="images"
			class="image-grid-view"
			:max-rows="maxRows"
			:show-more-items-indicator="showMoreItemsIndicator"
			@click="handleImageClick"
			@more-items-click="handleMoreItemsClick">
			<template #item="{item}">
				<Skeleton
					v-if="!loadedImages.includes(item.id)"
					size="100%"
					class="image-grid-view-item-image-skeleton absolute"
					style="z-index: 1; border-radius: 0;"/>
				<img
					v-if="!failedImages.includes(item.id)"
					:src="item.url"
					:alt="item.caption"
					class="image-grid-view-item-image select-none"
					style="cursor: pointer"
					@load="handleItemImageLoad($event, item)"
					@error="handleImageError($event, item)"/>
				<div
					v-if="showItemCaption && loadedImages.includes(item.id)"
					class="image-grid-view-item-image-caption bg-gray-900 text-white opacity-60">
					{{ item.caption || '&nbsp;'}}
				</div>
			</template>
			<template #more-items-indicator="{nextItem, moreItemsCount}">
				<div
					class="absolute p-2 w-full h-full flex align-items-center justify-content-center bg-black-alpha-70"
					style="z-index: 1;">
					<h3 class="m-0 text-white-alpha-90 select-none">
						+{{ moreItemsCount }}
					</h3>
				</div>
				<Skeleton
					v-if="!loadedImages.includes(nextItem.id)"
					size="100%"
					class="image-grid-view-item-image-skeleton absolute"
					style="z-index: 1; border-radius: 0"/>
				<img
					:src="nextItem.url"
					:alt="nextItem.caption"
					class="image-grid-view-item-image select-none"
					style="cursor: pointer"
					@load="handleItemImageLoad($event, nextItem)"
					@error="handleImageError($event, nextItem)"/>
			</template>
		</GridView>
	</div>
</template>
<style>
.image-grid-view-wrapper {
	position: relative;
}
.image-grid-view {
	container: image-grid-view / inline-size;
}
img.image-grid-view-item-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.image-grid-view-item-image-caption {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	cursor: pointer;
}
.image-grid-view-item-image-caption {
	padding: 4px 6px;
	font-size: 12px;
}

@container image-grid-view (width > 640px) {
	.image-grid-view-item-image-caption {
		font-size: 14px
	}
}
</style>