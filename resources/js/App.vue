<template>
  <RouterView></RouterView>
  <DialogLoading />
</template>

<script setup lang="ts">
import DialogLoading from './components/shared/DialogLoading.vue';
import { RouterView } from 'vue-router';
</script>
