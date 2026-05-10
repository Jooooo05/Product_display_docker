<script setup lang="ts">
const props = defineProps({
  title: String
});
</script>
         
<template>
  <!-- -------------------------------------------------------------------- -->
  <!-- Card with body -->
  <!-- -------------------------------------------------------------------- -->
  <v-card variant="outlined" elevation="0" class="bg-surface" rounded="lg">
    <v-card-text class="pa-8">  
      <slot />
    </v-card-text>   
  </v-card>
</template>
     