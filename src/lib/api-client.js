import axios from "axios";
import _ from "lodash";
import {useAuthStore} from "@/stores/auth.store.js";
import {
    URL_API_BASE,
    URL_API_AUTH_REFRESH,
    URL_API_AUTH_LOGOUT,
    URL_API_AUTH_REGISTER,
    URL_API_AUTH_LOGIN
} from "@/config/urls.js";
import {refreshAccessToken} from "@/services/auth.service.js";
import {logoutUser} from "@/stores/index.js";

const apiClient = axios.create();
apiClient.defaults.withCredentials = true;

apiClient.interceptors.request.use(config => {
    const {
        isAuthenticated,
        accessToken
    } = useAuthStore();
    const authUrlRegex = new RegExp(`^((${URL_API_AUTH_REGISTER})|(${URL_API_AUTH_LOGIN})|(${URL_API_AUTH_REFRESH}))`);

    if (!config.extra?.noAuth && isAuthenticated && !authUrlRegex.test(config.url)) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    if (typeof config.headers['Content-Type'] === 'undefined') {
        config.headers['Content-Type'] = 'application/json'
    }

    if (URL_API_BASE.endsWith(".ngrok-free.app")) {
        config.headers['ngrok-skip-browser-warning'] = "true";
    }

    console.log(`api-client[${config.method.toUpperCase()}][${config.url}]: Sending request`);

    return config;
});

apiClient.interceptors.response.use(
    response => {
        console.log(`api-client[${response.config.method.toUpperCase()}][${response.config.url}]: Request fulfilled`);

        return response;
    },
    async error => {
        const failedRequestMethod = error.config.method.toUpperCase();
        const failedRequestUrl = error.config.url;
        const failedRequestStatus = error.response?.status;

        console.log(`api-client[${failedRequestMethod}][${failedRequestUrl}]: Request failed${failedRequestStatus ? ` with status code - ${failedRequestStatus}` : ''}`);

        if (error.response?.status === 401) {
            const {
                isAuthenticated,
                refreshToken,
                setAuthenticated,
            } = useAuthStore();

            const isLogoutRequest = new RegExp(`^${URL_API_AUTH_LOGOUT}`).test(error.config.url);

            console.log(`api-client[${failedRequestMethod}][${failedRequestUrl}]: Authentication Error`);

            if (isLogoutRequest) console.log(`api-client[${failedRequestMethod}][${failedRequestUrl}]: Token refresh not applicable to logout request`);

            if (isAuthenticated && error.response?.data?.error_code === 'auth_expired_token' && !isLogoutRequest) {
                console.log(`api-client[${failedRequestMethod}][${failedRequestUrl}]: Expired access token`);

                if (!!refreshToken) {
                    try {
                        console.log(`api-client: Attempting to refresh token`);
                        const tokenData = await refreshAccessToken(refreshToken);
                        console.log(`api-client: Token refreshed`);

                        await setAuthenticated(tokenData);

                        console.log(`api-client[${failedRequestMethod}][${failedRequestUrl}]: Retrying request`);

                        return await apiClient(error.config);
                    } catch (e) {
                        console.log(`api-client[${failedRequestMethod}][${failedRequestUrl}]: Failed to retry request`);

                        if (e.response?.status === 401 || e.response?.data?.error_code?.startsWith('auth_')) {
                            console.log(`api-client[${failedRequestMethod}][${failedRequestUrl}]: Failure reason invalid refresh token or access token`);
                            await logoutUser(false);
                        }
                    }
                }
            }
        }

        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    response => response,
    error => {
        if (!error.response) {
            error.response = {
                state: 500,
                data: {
                    message: error.message || "Internal Server Error",
                }
            }
        }

        error.response.hasValidationErrors = error.response?.status === 422;
        error.response.data.errors = _.isObject(error.response.data.errors) ? error.response.data.errors : {};

        return Promise.reject(error);
    }
);

export default apiClient;