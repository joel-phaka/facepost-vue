import {createRouter, createWebHistory} from "vue-router";
import {useAuthStore} from "@/stores/auth.store.js";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import('../views/home/HomeIndex.vue'),
            meta: { requiresAuth: true, title: 'Home', layout: 'Default' }
        },
        {
            path: '/about',
            component: () => import('../views/home/About.vue'),
            meta: { requiresAuth: false, title: 'Home', layout: 'Default' }
        },
        {
            path: '/:auth(login|signin)',
            component: () => import('../views/auth/SignIn.vue'),
            meta: { requiresAuth: false, title: 'Sign In', layout: 'Auth' },
            props: true
        },
        {
            path: '/:auth(register|signup)',
            component: () => import('../views/auth/SignUp.vue'),
            meta: { requiresAuth: false, title: 'Sign Up', layout: 'Auth' }
        },
        {
            path: '/u/',
            component: () => import('../views/profile/ProfileIndex.vue'),
            meta: { requiresAuth: true, title: 'Profile', layout: 'Profile' }
        },
        {
            path: '/post/:id',
            component: () => import('../views/post/Post.vue'),
            meta: { requiresAuth: true, title: 'Post', layout: 'Default' }
        },
    ]
});

router.beforeEach(async (to, from, next) => {
    const {isAuthenticated} = useAuthStore();
    let navigationData = null

    if (isAuthenticated) {
        if (['/login', '/signin', '/register', '/signup'].includes(to.path)) {
            navigationData = {path: '/'};
        }
    } else {
        if (to.meta?.requiresAuth && !['/login', '/signin'].includes(to.path)) {
            navigationData  = {
                path: 'signin',
                query: ['/logout', '/signout'].includes(to.path) ? {} : {continue: to.path}
            }
        }
    }

    if (!!navigationData) next(navigationData);
    else next();
});

export default router;