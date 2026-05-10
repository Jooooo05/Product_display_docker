<script setup lang="ts">
const props = defineProps({
  title: String
});
</script>

<template>
  <!-- -------------------------------------------------------------------- -->
  <!-- Card with Header & Footer -->
  <!-- -------------------------------------------------------------------- -->
  <v-card variant="outlined" elevation="0" class="bg-surface">
    <v-card-text class="py-4">
      <div class="d-flex justify-space-between align-center">
        <h5 class="text-h5 mb-0">{{ props.title }}</h5>
        <slot name="header" />
      </div>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-item class="pa-0">
      <slot />
    </v-card-item>
  </v-card>
</template>
