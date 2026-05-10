<script setup lang="ts">
import { useSlots } from 'vue';

const props = defineProps({
  title: String,
  actionClass: String
});

const slots = useSlots();
</script>

// ===============================|| Ui Parent Card||=============================== //
<template>
  <v-card variant="outlined" elevation="0" class="bg-surface" rounded="lg">
    <v-card-item class="pa-5">
      <div class="d-flex align-center justify-space-between">
        <v-card-title class="text-subtitle-1" style="line-height: 1.57">{{ props.title }}</v-card-title>
        <slot name="action"></slot>
      </div>
    </v-card-item>
    <v-divider></v-divider>
    <v-card-text>
      <slot />
    </v-card-text>
    <template v-if="slots.footer">
      <v-divider></v-divider>
      <v-card-actions :class="actionClass">
        <slot name="footer" />
      </v-card-actions>
    </template>
  </v-card>
</template>
