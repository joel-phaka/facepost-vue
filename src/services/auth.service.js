import apiClient from "@/lib/api-client.js";
import {
    URL_API_AUTH_LOGIN,
    URL_API_AUTH_LOGOUT,
    URL_API_AUTH_REFRESH,
    URL_API_AUTH_REGISTER,
    URL_API_AUTH_USER
} from "@/config/urls.js";
import axios from "axios";

export async function login(credentials) {
    const response = await apiClient.post(URL_API_AUTH_LOGIN, credentials);

    return response.data;
}

export async function refreshAccessToken(refreshToken) {
    console.log(`auth-service[POST][${URL_API_AUTH_REFRESH}]: Sending request to refresh token`);

    const response = await axios.post(URL_API_AUTH_REFRESH, {refresh_token: refreshToken}, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    });

    return response.data;
}

export async function register(data) {
    const response = await apiClient.post(URL_API_AUTH_REGISTER, data);

    return response.data;
}

export async function fetchAuthUser() {
    const response = await apiClient.get(URL_API_AUTH_USER);

    return response.data;
}

export async function logout(accessToken) {
    const headers = {};

    if (!!accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await apiClient.post(URL_API_AUTH_LOGOUT, null, {headers});

    return response.data;
}