<script setup lang="ts">
const props = defineProps({
  title: String
});
</script>

// ===============================|| Ui Parent Card||=============================== //
<template>
  <v-card variant="outlined" elevation="0" class="bg-surface" rounded="lg">
    <v-card-item>
      <div class="d-flex align-center justify-space-between">
        <v-card-title class="text-h6 pa-0">{{ props.title }}</v-card-title>
        <slot name="action"></slot>
      </div>
    </v-card-item>
    <v-divider class="mb-3"></v-divider>
    <slot name="tabs"></slot>
    <v-card-text class="pa-0">
      <slot />
    </v-card-text>
  </v-card>
</template>
