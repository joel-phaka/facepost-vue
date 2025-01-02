import {usePostStore} from "@/stores/post.store.js";
import {useAuthStore} from "@/stores/auth.store.js";

export async function logoutUser(revokeToken = true) {
    const authStore = useAuthStore();
    const postStore = usePostStore();

    await authStore.setUnauthenticated(revokeToken);
    postStore.$reset();
}