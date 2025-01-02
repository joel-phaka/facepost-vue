<script setup>
import {usePostStore} from "@/stores/post.store.js";
import {useRoute} from "vue-router";
import {onMounted, ref} from "vue";
import ImageGridView from "@/components/image/ImageGridView.vue";
import apiClient from "@/lib/api-client.js";
import {URL_API_GALLERY} from "@/config/urls.js";


const route = useRoute();
const {getPost} = usePostStore();
const post = ref();
const images = ref([]);

onMounted(async () => {
	if (!post.value?.gallery_id) return;

	try {
		const {data} = await apiClient.get(`${URL_API_GALLERY}/${post.value.gallery_id}`);
		images.value = data.images;
	} catch (err) {
		console.log(err);
	}
});

post.value = await getPost(route.params.id);
</script>

<template>
	<Suspense>
	<template v-if="!!post">
		<div class="col-12 md:col-4 lg:col-4 md:mx-auto lg:mx-auto post-container">
			<h3>{{ post.title }}</h3>
			<pre class="post-content" style="font-family: inherit; white-space: pre-line;">
				{{ post.content }}
			</pre>
			<ImageGridView :images="images" :show-preview-caption="true"/>
		</div>
	</template>
</template>

<style scoped>
@media screen and (min-width: 640px) {
	.post-container {
		min-width: 640px;
	}
}
</style>