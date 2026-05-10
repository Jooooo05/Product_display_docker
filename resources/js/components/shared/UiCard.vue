<script setup lang="ts">
const props = defineProps({
  title: String
});
</script>

<template>
  <v-card variant="outlined" class="bg-surface mb-5" rounded="lg">
    <v-card-text class="pa-0">
      <div class="px-6 mt-6">
        <v-row justify="space-between" class="align-center mb-3">
          <slot name="header" />
        </v-row>
      </div>
      <slot />
    </v-card-text>
  </v-card>
</template>
