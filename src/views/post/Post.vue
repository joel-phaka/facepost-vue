<script setup>
import {usePostStore} from "@/stores/post.store.js";
import {useRoute} from "vue-router";
import {ref} from "vue";
import ImageGridView from "@/components/image/ImageGridView.vue";
import AsyncComponent from "@/components/AsyncComponent.vue";
import SomethingWentWrong from "@/components/error/SomethingWentWrong.vue";
import TextViewer from "@/components/TextViewer.vue";
import PostViewItem from "@/components/post/PostViewItem.vue";


const route = useRoute();
const {getPost, getPostImages} = usePostStore();
const post = ref();
const images = ref([]);
const error = ref();

const loadPost = () => getPost(route.params.id);
const handleLoadSuccess = async (result) => {
	post.value = result;

	try {
		images.value = await getPostImages(post.value.id);
	} catch (err) {
		console.log(err);
	}
};

const handleLoadFail = (err) => {
	error.value = err;
};

const handleLike = (p) => {
	post.value = p;
};
</script>

<template>
	<Suspense>
		<template #fallback>
			<ProgressSpinner
				strokeWidth="4"
				class="absolute center-vertical-horizontal"
				style="width: 48px; height: 48px;"/>
		</template>
		<AsyncComponent
			:async-function="loadPost"
			@success="handleLoadSuccess"
			@fail="handleLoadFail"/>
	</Suspense>
	<PostViewItem
		v-if="post"
		:post="post"
		:images="images"
		class="col-12 md:col-4 lg:col-4 md:mx-auto lg:mx-auto post-container px-0 pt-4 pb-8"
		@like="handleLike"/>
	<SomethingWentWrong
		v-if="error"
		:message="error.response?.status === 404 ? `Not Found` : null"/>
</template>

<style scoped>
@media screen and (min-width: 768px) {
	.post-container {
		min-width: 680px;
	}
}
</style>