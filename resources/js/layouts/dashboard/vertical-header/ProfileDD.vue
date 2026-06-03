<script setup lang="ts">
import { ref } from 'vue';
import SvgSprite from '@/components/shared/SvgSprite.vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const profileItems = ref([
  { title: 'Edit Profile', icon: 'custom-edit' },
  { title: 'Customer Service', icon: 'custom-support' },
]);
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center pa-5">
      <v-avatar size="40" class="me-2">
        <img src="@/assets/images/users/avatar-6.png" width="40" alt="profile" />
      </v-avatar>
      <div>
        <h6 class="text-subtitle-1 mb-0">{{ authStore.user?.name || 'No Name' }}</h6>
        <p class="text-caption text-lightText mb-0">
          {{ authStore.user ? (authStore.user.is_dealer ? 'Dealer' : 'Admin') : 'No Role' }}
        </p>
      </div>
    </div>

    <v-divider></v-divider>

    <!-- Kalau sudah login -->
    <template v-if="authStore.token">
      <v-list class="px-2" aria-label="profile list">
        <v-list-item
          v-for="(item, index) in profileItems"
          :key="index"
          color="primary"
          base-color="secondary"
          rounded="md"
          :value="item.title"
        >
          <template v-slot:prepend>
            <div class="me-4">
              <SvgSprite :name="item.icon" style="width: 18px; height: 18px" />
            </div>
          </template>
          <v-list-item-title class="text-h6">{{ item.title }}</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2"></v-divider>

        <!-- Logout -->
        <v-list-item @click="authStore.logout()" color="error" base-color="error" rounded="md">
          <template v-slot:prepend>
            <div class="me-4">
              <SvgSprite name="custom-logout-1" style="width: 18px; height: 18px" />
            </div>
          </template>
          <v-list-item-title class="text-h6">Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </template>

    <!-- Kalau belum login -->
    <template v-else>
      <v-list class="px-2">
        <v-list-item
          @click="router.push('/auth/login')"
          color="primary"
          base-color="secondary"
          rounded="md"
        >
          <template v-slot:prepend>
            <div class="me-4">
              <SvgSprite name="custom-login" style="width: 18px; height: 18px" />
            </div>
          </template>
          <v-list-item-title class="text-h6">Login</v-list-item-title>
        </v-list-item>
      </v-list>
    </template>
  </div>
</template>