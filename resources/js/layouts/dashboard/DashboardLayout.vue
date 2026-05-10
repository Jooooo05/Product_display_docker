<script setup lang="ts">
import { onMounted, onUnmounted, watch, computed, inject, ref, nextTick } from 'vue';
import { useTheme } from 'vuetify';
import { RouterView } from 'vue-router';
import LoaderWrapper from './LoaderWrapper.vue';
import TopProgress from './TopProgress.vue';
import VerticalSidebarVue from './vertical-sidebar/VerticalSidebar.vue';
import VerticalHeaderVue from './vertical-header/VerticalHeader.vue';
import HorizontalHeader from './horizontal-header/HorizontalHeader.vue';
import HorizontalSidebar from './horizontal-sidebar/HorizontalSidebar.vue';
// import Customizer from './customizer/CustomizerPanel.vue';
import FooterPanel from './footer/FooterPanel.vue';
import { useCustomizerStore } from '../../stores/customizer';
import { DirAttrSet, HexToRgb } from '@/utils/utils';
const customizer = useCustomizerStore();
const theme = useTheme();

// Set the initial direction attribute when the component is mounted
onMounted(() => {
  DirAttrSet(customizer.isRtl ? 'rtl' : 'ltr');
window.addEventListener('softrefresh', handleSoftRefresh, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('softrefresh', handleSoftRefresh);
});

// Watch for changes in the isRtl property and update the direction attribute accordingly
watch(
  () => customizer.isRtl,
  (newValue) => {
    DirAttrSet(newValue ? 'rtl' : 'ltr');
  }
);

// Define the computed property to calculate the dynamic style object
const dynamicStyle = computed(() => {
  const colors = theme.current.value?.colors;
  if (!colors) return {};

  return {
    '--v-theme-primary': HexToRgb(colors.primary),
    '--v-theme-darkprimary': HexToRgb(colors.darkprimary),
    '--v-theme-lightprimary': HexToRgb(colors.lightprimary)
  };
});

// Method to conditionally apply the preset class
const getStyleObject = () => {
  // Define your condition here, for example:
  const condition = true; // Replace this with your actual condition

  return condition ? dynamicStyle.value : {};
};
// Soft refresh key: remount RouterView untuk refresh konten tanpa hard reload
const refreshKey = ref(0);
function handleSoftRefresh() {
  refreshKey.value++;
  nextTick(() => {
    // Beri sinyal ke TopProgress bahwa remount selesai
    window.dispatchEvent(new Event('softrefresh-done'));
  });
}
</script>

<template>
  <v-locale-provider :rtl="customizer.isRtl">
    <v-app
      :style="getStyleObject()"
      :theme="customizer.actTheme"
      :class="[
        customizer.actTheme,
        customizer.fontTheme,
        customizer.miniSidebar ? 'mini-sidebar' : '',
        customizer.isHorizontalLayout ? 'horizontalLayout' : 'verticalLayout',
        customizer.inputBg ? 'inputWithbg' : '',
        customizer.themeContrast ? 'contrast' : ''
      ]"
    >
      <Customizer />
      <VerticalSidebarVue v-if="!customizer.isHorizontalLayout" />
      <VerticalHeaderVue v-if="!customizer.isHorizontalLayout" />
      <HorizontalHeader v-if="customizer.isHorizontalLayout" />
      <HorizontalSidebar v-if="customizer.isHorizontalLayout" />

      <v-main class="page-wrapper">
        <v-container fluid>
          <div :class="customizer.boxed ? 'maxWidth' : ''">
            <!-- Loader start -->
            <LoaderWrapper />
            <!-- Loader end -->
            <TopProgress>
              <RouterView :key="refreshKey" />
            </TopProgress>
          </div>
        </v-container>
        <v-container fluid class="pt-0">
          <div :class="customizer.boxed ? 'maxWidth' : ''">
            <FooterPanel />
          </div>
        </v-container>
      </v-main>
    </v-app>
  </v-locale-provider>
</template>
