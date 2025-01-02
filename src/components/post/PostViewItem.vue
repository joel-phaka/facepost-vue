<script setup>
import {ref, toRefs, useAttrs} from "vue";
import ImageGridView from "@/components/image/ImageGridView.vue";
import TextViewer from "@/components/TextViewer.vue";
import UserAvatar from "@/components/image/UserAvatar.vue";
import moment from "moment";
import {usePostStore} from "@/stores/post.store.js";
import ImageGridViewDialog from "@/components/image/ImageGridViewDialog.vue";

const props = defineProps({
	post: {
		type: Object,
		required: true
	},
	images: {
		type: Array,
		default: []
	},
	showTitle: {
		type: Boolean,
		default: true
	}
});

const emit = defineEmits(["like"]);
const attrs = useAttrs();

const {post, images, showTitle} = toRefs(props);
const isLikingInProgress = ref(false);
const isMoreImagesVisible = ref(false);

const postStore = usePostStore();

const handleLike = async () => {
	try {
		isLikingInProgress.value = true;
		const data = await postStore.likeOrUnlikePost(post.value);
		emit("like", data);
	} catch (err) {
		//
	} finally {
		isLikingInProgress.value = false;
	}
};
</script>

<template>
	<div>
		<div class="flex align-items-center">
			<div class="flex flex-grow-0">
				<UserAvatar :user="post.user" class="flex-grow-0"/>
				<div class="flex flex-column pl-3">
					<h5 class="m-0">{{ post.user.first_name }} {{ post.user.last_name }}</h5>
					<div class="flex align-items-center text-400" style="font-size: 14px">
						<div>@{{ post.user.username }}</div>
						<span>&nbsp;&bullet;&nbsp;</span>
						<div>{{ moment(post.created_at).fromNow() }}</div>
					</div>
				</div>
			</div>
		</div>
		<h2 v-if="showTitle">{{ post.title }}</h2>
		<TextViewer
			:text="post.content"
			:toggleable="true"
			:toggleable-max-length="250"/>
		<ImageGridView
			:images="images"
			:show-preview-caption="true"
			:expected-images-count="post.gallery_images_count"
			:show-more-items-indicator="true"
			:max-rows="1"
			class="mt-5"
			@more-images-click="isMoreImagesVisible = true"/>
		<div class="mt-6">
			<div v-if="!!post.likes_count || !!post.comments_count" class="flex mb-2 text-400">
				<span v-if="!!post.likes_count" class="mr-auto">
				    {{ post.likes_count }} like{{ post.likes_count > 1 ? 's' : '' }}
				</span>
				<span v-if="post.comments_count" class="ml-auto cursor-pointer">
				    {{ post.comments_count }} comment{{post.comments_count > 1 ? 's' : '' }}
				</span>
			</div>
			<Card
				style="border-radius: 0"
				:pt:body="{style: {'padding': '0'}}">
				<template #content>
					<div class="flex align-items-center" style="gap: 8px; padding: 8px">
						<Button
							:disabled="isLikingInProgress"
							:icon="`pi pi-thumbs-${post.is_liked ? 'up' : 'down'}`"
							severity="info"
							rounded
							outlined aria-label="Thumb"
							@click="handleLike"/>
						<span class="text-gray-500">|</span>
						<Button
							icon="pi pi-comment"
							severity="info"
							rounded
							outlined
							aria-label="Comment"/>
					</div>
				</template>
			</Card>
		</div>
		<ImageGridViewDialog
			v-model:visible="isMoreImagesVisible"
			:images="images"
			:show-preview-caption="true"
			:show-item-caption="true"
			:expected-images-count="post.gallery_images_count"
			:show-more-items-indicator="false"
			style="width: 88%; max-width: 950px"/>
	</div>
</template>

<style scoped>

</style>