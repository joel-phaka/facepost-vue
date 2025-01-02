<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import {useAuthStore} from "@/stores/auth.store.js";
import {storeToRefs} from "pinia";
import {inject, onMounted, onUnmounted, watch} from "vue";
import browserStorage from "@/lib/browser-storage.js";
import siteLogo from "@/assets/facepost-blue.png"
import * as utils from "@/lib/utils.js";
import axios from "axios";
import {URL_API_AUTH} from "@/config/urls.js";
import {useRoute, useRouter} from "vue-router";
import * as authService from "@/services/auth.service.js"

const route = useRoute();
const router = useRouter();

const setLayoutProcessing = inject('app:layout:auth:setLayoutProcessing');

const schema = yup.object({
	email: yup
		.string()
		.label('Email')
		.required()
		.email(),
	password: yup
		.string()
		.label('Password')
		.required()
});

const { meta, defineField, errors, handleSubmit } = useForm({
	validationSchema: toTypedSchema(schema),
	initialValues: {
		email: (browserStorage.getAndRemove('loginEmail') ?? ''),
		password: ''
	}
});

const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');

const {isAuthenticating, authError} = storeToRefs(useAuthStore());
const {loginUser, setAuthenticated} = useAuthStore();

watch(isAuthenticating, setLayoutProcessing, {immediate: true, deep: true});

const onSubmit = handleSubmit(async (values) => {
	await loginUser(values);
});

const openOauthWindow = (provider) => {
	const params = new URLSearchParams({
		state_id: utils.randomHash(),
		return_to: window.location.href
	});

	const oauthUrl = `${import.meta.env.VITE_APP_URL_API_BASE}/login/${provider}?${params.toString()}`;

	window.open(oauthUrl, '_blank');
	window.close();
};

onMounted(async () => {
	if (!!route.query.token?.trim() && utils.isJwtToken(route.query.token)) {
		try {
			isAuthenticating.value = true;

			const authResponse = await axios.post(URL_API_AUTH, {}, {
				headers: {'Authorization': `Bearer ${route.query.token}`}
			});

			await authService
				.refreshAccessToken(authResponse.data.refresh_token)
				.then(setAuthenticated);

			const continueToPath = /^\/.+/.test(route.query.continue) ? route.query.continue : '/';

			await router.replace(continueToPath)
		} catch (e) {
			console.log(e)
		} finally {
			isAuthenticating.value = false;
		}
	}
});

onUnmounted(() => {

})
</script>
<template>
	<form @submit="onSubmit" id="signInForm">
		<div class="text-center mb-5">
			<img :src="siteLogo" alt="form-site-logo" class="form-site-logo">
			<h2>Sign In</h2>
			<p v-if="!!authError?.loginError" class="text-red-500">
				<template v-if="authError?.loginError?.data?.error_code === 'auth_invalid_credentials'">
					Incorrect email or password
				</template>
				<template v-else-if="authError?.loginError?.hasValidationErrors">
					Email and password are required.
				</template>
				<template v-else>
					An error occurred. Please try again later.
				</template>
			</p>
			<p v-else-if="!meta.dirty">Enter your email and password to sign in.</p>
		</div>
		<div>
			<div class="mb-3">
				<label for="email" class="block pb-1">Email</label>
				<InputText v-model="email" :invalid="!!errors.email" v-bind="emailAttrs" id="email" placeholder="Email" class="block w-full"/>
				<p v-if="!!errors.email" class="mt-2 text-red-500">{{errors.email}}</p>
			</div>
			<div class="mb-3">
				<label for="password" class="block pb-1">Password</label>
				<InputText v-model="password" :invalid="!!errors.password" v-bind="passwordAttrs" id="password" type="password" placeholder="Password" class="block w-full"/>
				<p v-if="!!errors.password" class="mt-2 text-red-500">{{errors.password}}</p>
			</div>
			<Button type="submit" :disabled="!meta.valid" class="block w-full mt-5 text-center">Sign In</Button>
			<p class="text-center mt-5 mb-0">
				Don't have an account? <router-link to="/signup" class="no-underline">Sign Up</router-link>
			</p>
			<div>
				<Button
					class="block w-full mt-5 text-center"
					@click="openOauthWindow('google')">
					Sign in with Google
				</Button>
			</div>
		</div>
	</form>
</template>