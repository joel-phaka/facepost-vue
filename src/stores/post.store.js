import {defineStore} from "pinia";
import {
    URL_API_POSTS,
    URL_API_PROFILE,
    URL_API_LIKES_UNLIKE,
    URL_API_LIKES_LIKE, URL_API_GALLERY
} from "@/config/urls.js";
import apiClient from "@/lib/api-client.js";
import * as _ from "lodash";
import utils from "@/lib/utils.js";

const getPostsStructure = () => ({
    data: [],
    meta: {
        current_page: null,
        first_page_url: null,
        from: null,
        last_page: null,
        last_page_url: null,
        links: [],
        next_page_url: null,
        path: null,
        per_page: null,
        prev_page_url: null,
        to: null,
        total: null,
        is_last_page: false,
        has_more_pages: true,
        has_data: true,
        is_empty: false
    },
    isFetchingPosts: false,
    fetchPostsError: null,
    initialFetch: true,
    hasFetchedInitialPosts: false,
});
const getUserPostsStructure = () => ({...getPostsStructure(), ...{user_id: null}});
const getDefaultState = () => ({
    posts: ({...getPostsStructure()}),
    user_posts: ({...getUserPostsStructure()}),
});

const actionMapping = {
    'fetch_posts': 'posts',
    'fetch_user_posts': 'user_posts'
};

export const usePostStore = defineStore({
    id: 'post',
    state: () => ({...getDefaultState()}),
    actions: {
        async getPosts(params = {}) {
            params = Object(params);
            const paginate = !!params.paginate;
            const query = Object(params.query)
            const user_id = params.user_id;
            const action = params.action || 'fetch_posts';
            const onError = params.onError;

            if (!Object.keys(actionMapping).includes(action)) return;

            const actionKeyName = actionMapping[action];

            try {
                let append = false;
                let url = URL_API_POSTS;

                if (paginate) {
                    if (!this[actionKeyName].isFetchingPosts && !!this[actionKeyName].meta.next_page_url) {
                        let canPaginate = true;

                        if (action === 'fetch_user_posts' && !!this[actionKeyName].user_id && !!this[actionKeyName].user_id !== user_id) {
                            if (!!user_id) url = `${URL_API_PROFILE}/${user_id}/posts`;

                            canPaginate = false;
                        }

                        if (canPaginate) {
                            url = this[actionKeyName].meta.next_page_url;
                            append = true;
                        }
                    } else {
                        return;
                    }
                } else {
                    if (action === 'fetch_user_posts') {
                        if (!!user_id) url = `${URL_API_PROFILE}/${user_id}/posts`;
                        else {
                            Object.assign(this[actionKeyName], getUserPostsStructure());

                            return;
                        }
                    }
                }

                this[actionKeyName].isFetchingPosts = true;

                const {data} = await apiClient.get(url, {params: query});

                this[actionKeyName].data = !append
                    ? data.data
                    : [...this[actionKeyName].data, ...data.data.filter(np => !this[actionKeyName].data.some(p => p.id === np.id))];

                this[actionKeyName].meta = data.meta;
            } catch (error) {
                this[actionKeyName].fetchPostsError = error;

                if (_.isFunction(onError)) onError(error);
            } finally {
                if (this[actionKeyName].initialFetch) {
                    this[actionKeyName].initialFetch = false;
                }
                this[actionKeyName].isFetchingPosts = false;

                if (!this[actionKeyName].hasFetchedInitialPosts) {
                    this[actionKeyName].hasFetchedInitialPosts = true;
                }
            }
        },
        async getPost(id) {
            const url = `${URL_API_POSTS}/${id}`;

            const {data} = await apiClient.get(url);

            this.updatePostByIndex(data);

            return data;
        },
        async getPostImages(id) {
            const url = `${URL_API_POSTS}/${id}/images`;

            const {data} = await apiClient.get(url);

            return data;
        },
        async likeOrUnlikePost(post) {
            const url = `${post.is_liked ? URL_API_LIKES_UNLIKE : URL_API_LIKES_LIKE}/post/${post.id}`;

            const {data} = await (post.is_liked ? apiClient.delete(url) : apiClient.post(url));

            this.updatePostByIndex(data.post);

            return data.post;
        },
        async createPost(data) {
            const {data: post} = await apiClient.post(URL_API_POSTS, data, {
                headers: {'content-type': 'multipart/form-data'}
            });

            this.posts.data.unshift(post);

            return post;
        },
        updatePostByIndex(data) {
            for (const [action, actionKeyName] of Object.entries(actionMapping)) {
                const index = this[actionKeyName].data.findIndex(p => p.id === data?.id);

                if (index > -1 && !!data?.id) {
                    this[actionKeyName].data[index] = data;
                }
            }
        },
        clearErrors() {
            for (const [action, actionKeyName] of Object.entries(actionMapping)) {
                this[actionKeyName].fetchPostsError = null;
            }
        }
    }
});