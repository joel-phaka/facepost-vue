import {defineStore} from "pinia";
import browserStorage from "@/lib/browser-storage.js";
import * as authService from "@/services/auth.service.js";
import router from "@/router/index.js";
import * as utils from "@/lib/utils.js";


const getDefaultState = () => {
    return {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticating: false,
        isRefreshingToken: false,
        isFetchingAuthUser: false,
        isLoggingOut: false,
        authError: {
            loginError: null,
            fetchUserError: null,
        }
    };
};

export const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({...getDefaultState()}),
    persist: {
        paths: [
            'user',
            'accessToken',
            'refreshToken'
        ],
    },

    getters: {
        isAuthenticated: state => !!state.user && !!state.accessToken,
    },
    actions: {
        async setAuthenticated(data) {
            if (!!data?.user.id && !!data?.access_token?.length) {
                this.accessToken = data.access_token;
                this.refreshToken = data.refresh_token;
                this.user = {...data.user, profile_picture_base64: null};

                if (!!this.user.profile_picture) {
                    utils.base64ImageFromUrl(this.user.profile_picture)
                        .then(base64String => {
                            this.user.profile_picture_base64 = base64String;
                        })
                        .catch(err => {})
                }
            }
        },
        setUnauthenticated(revokeToken = true) {
            return new Promise(resolve => {
                if (revokeToken) {
                    authService.logout(this.accessToken)
                        .catch(() => {});
                }

                browserStorage.clearAllExcept(['themeMode']);
                this.$reset();

                resolve(true);
            });
        },
        async loginUser(credentials) {
            try {
                this.clearErrors()
                this.isAuthenticating = true;
                
                const data = await authService.login(credentials);
                await this.setAuthenticated(data);

                let continueToPath = '/';

                const currentRoute = router.currentRoute.value;

                if (!!currentRoute && /^\/\S/.test(currentRoute.query.continue) && !/^\/(login)|(signin)|(logout)|(signout)/.test(currentRoute.query.continue)) {
                    continueToPath = currentRoute.query.continue;
                }

                await router.replace({path: continueToPath});
            } catch (error) {
                console.log(error)

                this.authError.loginError = error.response ?? error.message;
            } finally {
                this.isAuthenticating = false;
            }
        },
        async getAuthUser() {
            try {
                this.clearErrors();
                this.isFetchingAuthUser = true;
                const data = await authService.fetchAuthUser();

                if (!!data?.id) {
                    this.user = data;
                }
            } catch (error) {
                this.authError.fetchUserError = error.response ?? error.message;
            } finally {
                this.isFetchingAuthUser = false;
            }
        },
        clearErrors() {
            this.authError.loginError = null;
            this.authError.fetchUserError = null;
        }
    }
});