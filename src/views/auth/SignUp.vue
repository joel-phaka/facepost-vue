<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import utils from "@/lib/utils.js";
import {inject, ref} from "vue";
import apiClient from "@/lib/api-client.js";
import {URL_API_AUTH_REGISTER} from "@/config/urls.js";
import {useRouter} from "vue-router";
import browserStorage from "@/lib/browser-storage.js";
import siteLogo from "@/assets/facepost-blue.png"

const setLayoutProcessing = inject('app:layout:auth:setLayoutProcessing');

const schema = yup.object({
	firstName: yup
			.string()
			.label("First Name")
			.required(),
	lastName: yup
			.string()
			.label("Last Name")
			.required(),
	email: yup
			.string()
			.label("Email")
			.required()
			.email(),
	password: yup
			.string()
			.label("Password")
			.required(),
	passwordConfirmation: yup
			.string()
			.label("Confirm Password")
			.required()
			.oneOf([yup.ref("password")], 'Passwords do not match')
			.required(),
	acceptTerms: yup
			.bool()
			.oneOf([true], "Please read the terms and conditions and then accept them to continue.")
});

const { meta, defineField, errors, setErrors, handleSubmit } = useForm({
	validationSchema: toTypedSchema(schema),
});

const [firstName, firstNameAttrs] = defineField('firstName');
const [lastName, lastNameAttrs] = defineField('lastName');
const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');
const [passwordConfirmation, passwordConfirmationAttrs] = defineField('passwordConfirmation');
const [acceptTerms, acceptTermsAttrs] = defineField('acceptTerms');

const serverError = ref();

const router = useRouter();

const onSubmit = handleSubmit(async () => {
	try {
		serverError.value = null;
		setLayoutProcessing(true);

		await apiClient.post(URL_API_AUTH_REGISTER, {
			first_name: firstName.value,
			last_name: lastName.value,
			email: email.value,
			password: password.value,
			password_confirmation: passwordConfirmation.value,
			accept_terms: acceptTerms.value
		});

		browserStorage.set('loginEmail', email.value);
		await router.replace({
			path: '/signin',
		});
	} catch (error) {
		serverError.value = error.response;
		if (error.response.hasValidationErrors) {
			setErrors(utils.keysToCamelCase(error.response.data.errors));
		}
	} finally {
		setLayoutProcessing(false);
	}
});

</script>

<template>
	<form @submit="onSubmit" id="signUpForm">
		<div class="mb-5">
			<img :src="siteLogo" alt="site-logo" class="form-site-logo">
			<h2>Sign Up</h2>
			<p v-if="serverError && !serverError?.hasValidationErrors" class="text-red-500">An error occurred. Please try again later.</p>
		</div>
		<div>
			<div class="mb-3">
				<label for="firstName" class="block pb-1">First Name</label>
				<InputText v-model="firstName" :invalid="!!errors.firstName" v-bind="firstNameAttrs" id="firstName" placeholder="First Name" class="block w-full"/>
				<p v-if="!!errors.firstName" class="mt-2 text-red-500">{{errors.firstName}}</p>
			</div>
			<div class="mb-3">
				<label for="lastName" class="block pb-1">Last Name</label>
				<InputText v-model="lastName" :invalid="!!errors.lastName" v-bind="lastNameAttrs" id="lastName" placeholder="Last Name" class="block w-full"/>
				<p v-if="!!errors.lastName" class="mt-2 text-red-500">{{errors.lastName}}</p>
			</div>
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
			<div class="mb-3">
				<label for="passwordConfirmation" class="block pb-1">Confirm Password</label>
				<InputText v-model="passwordConfirmation" :invalid="!!errors.passwordConfirmation" v-bind="passwordConfirmationAttrs" id="passwordConfirmation" type="password" placeholder="Confirm Password" class="block w-full"/>
				<p v-if="!!errors.passwordConfirmation" class="mt-2 text-red-500">{{errors.passwordConfirmation}}</p>
			</div>
			<div>
				<div class="mb-3 flex align-items-center">
					<Checkbox v-model="acceptTerms" binary name="acceptTerms" v-bind="acceptTermsAttrs" inputId="acceptTerms"/>
					<label for="acceptTerms" class="ml-2 cursor-pointer">I accept terms and conditions</label>
				</div>
				<p v-if="!!errors.acceptTerms" class="mt-2 text-red-500">{{errors.acceptTerms}}</p>
			</div>
			<Button type="submit" :disabled="!meta.valid" class="block w-full mt-5 text-center">Sign In</Button>
			<p class="text-center mt-5 mb-0">
				Already have an account? <router-link to="/signin" class="no-underline">Sign In</router-link>
			</p>
		</div>
	</form>
</template>