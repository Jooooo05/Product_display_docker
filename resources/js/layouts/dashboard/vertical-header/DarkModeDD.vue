<script setup lang="ts">
import { useTheme } from 'vuetify';
import { computed, onMounted } from 'vue';
import { useCustomizerStore } from '@/stores/customizer';

const vuetifyTheme = useTheme();
const customizer = useCustomizerStore();
const isDark = computed(() => vuetifyTheme.global.current.value.dark)

const toggleTheme = () => {
  const newTheme = isDark.value ? 'light' : 'dark';
  customizer.SET_THEME(newTheme);
  vuetifyTheme.global.name.value = newTheme;
  localStorage.setItem('theme', newTheme);
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    customizer.SET_THEME(savedTheme);
    vuetifyTheme.global.name.value = savedTheme;
  }
})
</script>

<template>
      <v-menu :close-on-content-click="false" location="bottom" offset="6, 80">      
      <template v-slot:activator="{ props }">
        <v-btn 
          icon 
          class="ms-sm-2 ms-1" 
          color="secondary"
          aria-label="theme toggle button" 
          rounded="sm"
          @click="toggleTheme"
        >
          <SvgSprite :name="isDark ? 'custom-sun' : 'custom-moon-fill'" />
        </v-btn>
      </template>
    </v-menu>
</template>
