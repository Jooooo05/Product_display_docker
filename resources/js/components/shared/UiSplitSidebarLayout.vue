<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

const props = withDefaults(
  defineProps<{
    title?: string;
    sidebarWidth?: number | string;
    drawerWidth?: number | string;
  }>(),
  {
    title: '',
    sidebarWidth: 350,
    drawerWidth: 300,
  }
);

const emit = defineEmits<{
  (e: 'request-reflow'): void;
}>();

const sDrawer = ref(false);
const toggleSide = ref(false);

const display = useDisplay();
const mdAndUp = computed(() => display.mdAndUp.value);
const sidebarWidthCss = computed(() =>
  typeof props.sidebarWidth === 'number' ? `${props.sidebarWidth}px` : props.sidebarWidth
);
const layoutHeight = computed(() => (mdAndUp.value ? 'calc(100vh - auto)' : 'auto'));

function toggleSidebar() {
  if (mdAndUp.value) {
    toggleSide.value = !toggleSide.value;
  } else {
    sDrawer.value = !sDrawer.value;
  }
  emit('request-reflow');
}

watch(mdAndUp, (next) => {
  if (next) sDrawer.value = false;
  else toggleSide.value = false;
  emit('request-reflow');
});
watch(sDrawer, () => emit('request-reflow'));
watch(toggleSide, () => emit('request-reflow'));
</script>

<template>
  <v-row class="ma-0 d-flex flex-row flex-nowrap w-100" :style="{ height: layoutHeight }">
    <v-col
      cols="auto"
      v-if="!toggleSide && mdAndUp"
      class="d-flex align-stretch pe-md-0"
      :style="{ width: sidebarWidthCss, maxWidth: sidebarWidthCss }"
    >
      <v-card variant="outlined" class="bg-surface br-0 h-100 d-flex flex-column" rounded="lg">
        <v-card-text class="h-100 d-flex flex-column" style="min-height: 0">
          <slot name="sidebar" :mdAndUp="mdAndUp" :toggleSidebar="toggleSidebar" />
        </v-card-text>

      </v-card>
    </v-col>

      <v-col class="d-flex align-stretch ps-md-0" style="flex: 1 1 auto; min-width: 0">
      <v-card variant="outlined" class="bg-surface overflow-hidden bl-0 w-100" rounded="lg">
        <div style="flex: 1; min-height: 0">
          <slot name="header" :mdAndUp="mdAndUp" :toggleSidebar="toggleSidebar">
            <v-row justify="space-between" dense class="pa-5 pb-0 align-center" style="min-width: 0">
                <v-col cols="auto">
                <v-btn
                  icon
                  rounded="md"
                  size="small"
                  variant="text"
                  color="primary"
                  class="mt-2"
                  aria-label="Toggle sidebar"
                  @click="toggleSidebar"
                >
                  <SvgSprite name="custom-menu-outline" style="width: 16px; height: 16px" />
                </v-btn>

                </v-col>
                <v-col cols="8" sm="3" md="6" class="flex-grow-1" style="min-width: 0">
                <div class="text-subtitle-1 font-weight-semibold w-100" style="min-width: 0">
                  <slot name="title">{{ props.title }}</slot>
                </div>
                </v-col>
            </v-row>
            <v-divider class="mt-4 pa-0" />
        </slot>
        <div class="flex-grow-1 w-100" style="min-height: 0; overflow: hidden">
          <slot name="content" :mdAndUp="mdAndUp" :toggleSidebar="toggleSidebar" />
        </div>
        </div>
      </v-card>
    </v-col>
  </v-row>

  <v-navigation-drawer temporary v-model="sDrawer" :width="props.drawerWidth" top v-if="!mdAndUp">
    <perfect-scrollbar :style="{ height: layoutHeight }">
      <v-card-text class="pa-5">
        <slot name="drawer" :mdAndUp="mdAndUp" :toggleSidebar="toggleSidebar">
          <slot name="sidebar" :mdAndUp="mdAndUp" :toggleSidebar="toggleSidebar" />
        </slot>
      </v-card-text>
    </perfect-scrollbar>
  </v-navigation-drawer>
</template>

<style lang="scss">
.br-0 {
  @media (min-width: 960px) {
    border-right: none;
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
    [dir='rtl'] & {
      border-left: none;
      border-right: 1px solid rgb(var(--v-theme-borderLight));
      border-top-right-radius: 8px !important;
      border-bottom-right-radius: 8px !important;
      border-top-left-radius: 0 !important;
      border-bottom-left-radius: 0 !important;
    }
  }
}
.bl-0 {
  @media (min-width: 960px) {
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
    [dir='rtl'] & {
      border-top-left-radius: 8px !important;
      border-bottom-left-radius: 8px !important;
      border-top-right-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
    }
  }
}
</style>
