<script setup>
import PostList from "@/components/post/PostList.vue";
import {usePostStore} from "@/stores/post.store.js";
import {storeToRefs} from "pinia";
import SomethingWentWrong from "@/components/error/SomethingWentWrong.vue";
import {ref} from "vue";

const postStore = usePostStore();
const {posts} = storeToRefs(postStore);
const error = ref();

const handleFailure = (err) => {
	error.value = err;
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
		<div class="flex pt-2">
			<div class="list-container md:mx-auto lg:mx-auto">
				<Card v-show="posts.hasFetchedPosts" class="mb-8">
					<template #content>
						<div class="flex">
							<Button size="small" class="mx-auto">Create a New Post</Button>
						</div>
					</template>
				</Card>
				<PostList action="fetch_posts" class="list-container" @loadfail="handleFailure"/>
			</div>
		</div>
	</Suspense>
	<SomethingWentWrong v-if="error" />
</template>

<style scoped>

</style>