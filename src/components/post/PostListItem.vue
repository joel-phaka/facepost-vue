<script setup>
import UserAvatar from "@/components/image/UserAvatar.vue";
import {inject, onBeforeMount, ref, toRef} from "vue";
import moment from "moment";
import {usePostStore} from "@/stores/post.store.js";
import apiClient from "@/lib/api-client.js";
import {URL_API_GALLERY} from "@/config/urls.js";
import ImageGridView from "@/components/image/ImageGridView.vue";

const props = defineProps({
	post: {
		type: Object,
		required: true
	}
});
const emit = defineEmits(["like"]);

const postStore = usePostStore();

const post = toRef(props, 'post');
const isProcessing = ref(false);
const showModal = ref(false);
const images = ref([]);
const loadImagesCount = ref(0);

const {isDarkMode} = inject('app:theme');

const handleLike = async () => {
	try {
		isProcessing.value = true;

		const data = await postStore.likeOrUnlikePost(post.value);
		emit("like", data.post);
	} catch (err) {
		//
	} finally {
		isProcessing.value = false;
	}
};

const loadImages = async () => {
	if (!post.value.gallery_id) return;

	try {
		const {data} = await apiClient.get(`${URL_API_GALLERY}/${post.value.gallery_id}`);
		images.value = data.images;
	} catch (err) {
		console.log(err);
	}
};

onBeforeMount(async () => {
	await loadImages();
});

</script>
<template>
    <Card :pt:body="{style: {'padding': '0'}}">
	    <template #content>
		    <div class="p-3">
			    <div class="flex align-items-start">
				    <UserAvatar :user="post.user" class="flex-grow-0"/>
				    <div class="flex-grow-1 pl-3">
					    <h5 class="m-0">{{ post.user.first_name }} {{ post.user.last_name }}</h5>
					    <span class="text-400" style="font-size: 12px">{{ moment(post.created_at).fromNow() }}</span>
				    </div>
			    </div>
		        <h4>{{ post.title }}</h4>
			    <p class="m-0">{{ post.content.substring(0, 100) }}...</p>
		    </div>
		    <img
			    v-if="!!post.poster_image"
			    :src="post.poster_image.url"
			    :alt="post.poster_image.caption"
			    style="width: 100%; max-height: 240px; object-fit: cover" />
	    </template>
	    <template #footer>
		    <div class="px-3 py-3 pb-2">
			    <div v-if="!!post.likes_count || !!post.comments_count" class="flex mb-2">
				    <span v-if="!!post.likes_count" class="mr-auto">
					    {{ post.likes_count }} like{{ post.likes_count > 1 ? 's' : '' }}
				    </span>
				    <RouterLink :to="`/post/${post.id}`">Open</RouterLink>
				    <span v-if="post.comments_count" class="ml-auto cursor-pointer">
					    {{ post.comments_count }} comment{{post.comments_count > 1 ? 's' : '' }}
				    </span>
			    </div>
			    <div class="flex align-items-center" style="gap: 4px">
				    <Button @click="handleLike" :disabled="isProcessing" icon="pi pi-thumbs-up" severity="info" rounded :outlined="!post.is_liked" aria-label="Thumb" />
				    <Button @click="showModal=true" :disabled="isProcessing" icon="pi pi-comment" severity="info" rounded outlined aria-label="Comment" />
				    <Dialog v-model:visible="showModal" modal :closeOnEscape="false" :header="post.title" :style="{ width: '90vw', 'max-width': '550px' }" :pt:footer:style="{'just-content': 'flex-stretch'}">
					    <pre class="m-0 mb-3" style="font-family: inherit; white-space: pre-line;">
						    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

						    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

						    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
					    </pre>
					    <ImageGridView :images="images" :show-preview-caption="true"/>
					    <template #footer>
						    <div class="w-full border-1 mt-3"
						         :class="{'border-gray-300': !isDarkMode, 'border-gray-600': isDarkMode}"
						         style="border-radius: 6px"
						         :style="{'background-color': isDarkMode ? '#101010': 'var(--gray-100)'}">
							    <Textarea class="w-full border-0 hover:border-0 focus:border-0 outline-none" style="resize: none"/>
							    <div class="flex" style="padding: 6px">
								    <Button icon="pi pi-send"
							            severity="info"
							            rounded
							            aria-label="Send"
							            class="ml-auto"
							            style="width: 32px; height: 32px;transform: rotate(45deg);"/>
							    </div>
						    </div>
					    </template>
				    </Dialog>
			    </div>
		    </div>
	    </template>
    </Card>
</template>
<style>
</style>