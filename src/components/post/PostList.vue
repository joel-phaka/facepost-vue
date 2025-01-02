<script setup>
import PostListItem from "@/components/post/PostListItem.vue";
import {usePostStore} from "@/stores/post.store.js";
import {onMounted, toRefs} from "vue";
import {storeToRefs} from "pinia";


const props = defineProps({
	action: {
		type: String,
		default: "fetch_posts",
		validator(value) {
			return ["fetch_posts", "fetch_user_posts"].includes(value)
		}
	},
	query: {
		type: Object,
		default: {},
	},
	showLoaderInitially: {
		type: Boolean,
		default: false
	}
});
const emit = defineEmits(["loadfail"]);

const {action, query, showLoaderInitially} = toRefs(props);

const postStore = usePostStore();
const {posts} = storeToRefs(postStore);

const loadMore = async(isVisible) => {
	if (isVisible && !posts.value.isFetchingPosts.value && posts.value.hasFetchedInitialPosts) {
		await postStore.getPosts({paginate: true});
	}
};

await postStore.getPosts({
	action: action.value,
	query: query.value,
	onError: (err) => {
		if (!posts.value.hasFetchedInitialPosts) emit('loadfail', err);
	}
});
</script>
<template>
	<div class="relative">
		<PostListItem
			v-for="post in posts.data"
			:key="post.id"
			:post="post"
			class="mb-3"/>
		<div v-observe-visibility="loadMore" style="height:10px"></div>
		<div class="flex align-items-center justify-content-center p-3">
			<ProgressSpinner
				v-if="posts.isFetchingPosts && (!posts.initialFetch || showLoaderInitially)"
				strokeWidth="4"
				style="width: 48px; height: 48px"/>
		</div>
	</div>
</template>
<style scoped>
</style>