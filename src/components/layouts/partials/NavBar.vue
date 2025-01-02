<script setup>
import {computed, inject, ref, onErrorCaptured} from "vue";
import siteLogo from '@/assets/facepost-blue.png'
import {storeToRefs} from "pinia";
import {useAuthStore} from "@/stores/auth.store.js";
import UserAvatar from "@/components/image/UserAvatar.vue";
import {logoutUser} from "@/stores/index.js";

const authStore = useAuthStore();
const {isAuthenticated, user} = storeToRefs(authStore);

const {isDarkMode, toggleThemeMode} = inject('app:theme');
const menuItems = ref([
	{label: 'Home', 'icon': 'pi pi-home', route: '/', requiresAuth: true},
]);
const accountMenu = ref();
const accountMenuItems = ref([
	{separator: true},
	{label: `Sign Out`, icon: 'pi pi-sign-out', command: async () => await logoutUser()},
	{
		label: computed(() => isDarkMode.value ? 'Light Mode' : 'Dark Mode'),
		icon: computed(() => isDarkMode.value ? 'pi pi-sun' : 'pi pi-moon'),
		command: toggleThemeMode
	},
]);

const toggleAccountMenu = (evt) => {
	accountMenu.value?.toggle(evt);
};

onErrorCaptured((err) => {
	console.log(err)
})
</script>

<template>
	<nav class="app--navbar">
		<Menubar
			:model="menuItems"
			style="border-radius:0"
			>
			<template #start>
				<div class="p-1 flex align-items-center app-logo-container" style="width: fit-content; margin-right:auto; border-radius: 8px">
					<img :src="siteLogo" alt="Facepost" style="height: 40px"/>
				</div>
			</template>
			<template #item="{ item, props }">
				<template v-if="!item.requiresAuth || (isAuthenticated && item.requiresAuth)">
					<RouterLink v-if="item.route" v-slot="{ href }" :to="item.route" custom>
						<a :href="href" v-bind="props.action" :class="['py-3']">
							<span :class="['p-menuitem-icon', item.icon]"></span>
							<span class="p-menuitem-text">{{ item.label }}</span>
						</a>
					</RouterLink>
					<a v-else :href="item.url" :target="item.target" v-bind="props.action" :class="['py-3']">
						<span :class="['p-menuitem-icon', item.icon]"></span>
						<span class="p-menuitem-text">{{ item.label }}</span>
					</a>
				</template>
			</template>
			<template #end>
				<div class="flex align-items-center" style="padding-right: 0.5rem">
					<UserAvatar
						v-if="isAuthenticated"
						:user="user"
						aria-haspopup="true"
						aria-controls="navbarAccountMenu"
						@click="toggleAccountMenu"/>
					<Menu
						v-if="isAuthenticated"
						ref="accountMenu"
						id="navbarAccountMenu"
						:model="accountMenuItems"
						:popup="true"
						:pt="{
							root: {style: {'position': 'fixed', 'top': '70px', 'width': '270px'}},
							start: {style: {'padding': '0.75rem'}},
							action: {class: ['py-3'], 'aria-hidden': 'false'},
						}">
						<template #start>
							<div class="flex flex-column align-items-center justify-content-center">
								<UserAvatar
									:user="user"
									:size="64"
									class="flex-grow-0"
									@click="toggleAccountMenu"/>
								<div class="mt-3 font-bold">
									{{ user.first_name }} {{ user.last_name }}
								</div>
								<div class="text-400 text-sm">
									@{{ user.username }}
								</div>
							</div>
						</template>
					</Menu>
				</div>
			</template>
		</Menubar>
	</nav>
</template>

<style scoped>

</style>