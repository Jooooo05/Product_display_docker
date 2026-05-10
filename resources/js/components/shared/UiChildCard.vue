<script setup lang="ts">
const props = defineProps({
  title: String
});
</script>

<template>
  <v-card variant="outlined" class="bg-surface" rounded="lg">
    <v-card-item class="pa-5">
      <div class="d-flex align-center justify-space-between">
        <v-card-title class="text-capitalize text-h5">{{ props.title }}</v-card-title>
        <slot name="action"></slot>
      </div>
    </v-card-item>
    <v-divider />
    <v-card-text>
      <slot />
    </v-card-text>
  </v-card>
</template>
