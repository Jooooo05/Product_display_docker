<template>
  <svg class="pc-icon">
    <use :xlink:href="`${spritePath}#${props.name}`"></use>
  </svg>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps({
  name: String
});

const spritePath = ref<string | null>(null);

onMounted(async () => {
  try {
    // Use absolute path from public to avoid BASE_URL (/build) in prod
    spritePath.value = '/assets/svg/sprite.svg';
  } catch (error) {
    console.error('Error loading SVG sprite:', error);
  }
});
</script>
