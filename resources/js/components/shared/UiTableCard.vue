<script setup lang="ts">
const props = defineProps({
  title: String
});
</script>

<template>
  <!-- ---------------------------------------------------- -->
  <!-- Table Card -->
  <!-- ---------------------------------------------------- -->
  <v-card variant="outlined" elevation="0" class="bg-surface overflow-hidden">
    <v-card-item class="pa-5">
      <div class="d-flex align-center justify-space-between">
          <v-card-title class="text-subtitle-1" style="line-height: 1.57">{{ props.title }}</v-card-title>
        <slot name="header"></slot>
      </div>
    </v-card-item>
    <v-divider></v-divider>
    <slot />
  </v-card>
</template>
