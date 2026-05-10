<script setup lang="ts">
import { useCustomizerStore } from '../../../stores/customizer';
import { useAuthStore } from '@/stores/auth';
import { useAccessStore } from '@/stores/user-management/access-store';
import sidebarItems from './sidebarItem';
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue';

import NavGroup from './NavGroup/NavGroup.vue';
import NavItem from './NavItem/NavItem.vue';
import NavCollapse from './NavCollapse/NavCollapse.vue';
import ExtraBox from './extrabox/ExtraBox.vue';
import Logo from '../logo/LogoMain.vue';

const customizer = useCustomizerStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const sidebarMenu = computed(() => {
  const userPermissions =
    authStore.user?.permission_list ||
    accessStore.permissions ||
    [];

  const hasAnyPermission = (perms?: string[]) => {
    if (!perms || perms.length === 0) return true;
    return perms.some((p) => userPermissions.includes(p));
  };

  const filterTree = (items: any[]): any[] => {
    const result: any[] = [];
    for (const item of items) {
      if (item.children && Array.isArray(item.children)) {
        const filteredChildren = filterTree(item.children);
        const itemPermitted = hasAnyPermission(item.permissions);
        if (itemPermitted && filteredChildren.length > 0) {
          result.push({ ...item, children: filteredChildren });
        } else if (!itemPermitted && filteredChildren.length > 0) {
          result.push({ ...item, children: filteredChildren });
        } else {
          continue;
        }
      } else {
        if (hasAnyPermission(item.permissions)) {
          result.push({ ...item });
        }
      }
    }
    return result;
  };

  const permittedItems = filterTree(sidebarItems);

  return permittedItems.filter((item, index) => {
    if (!item.header) return true;
    const nextItem = permittedItems[index + 1];
    if (!nextItem || nextItem.header) {
      return false;
    }

    return true;
  });
});

// Conditional activation: enable resize features only when miniSidebar is true
const isMobile = ref(window.innerWidth < 960);
const handleResize = () => {
  isMobile.value = window.innerWidth < 960;
};

let listenerAttached = false;
const attachResizeListener = () => {
  if (!listenerAttached) {
    window.addEventListener('resize', handleResize);
    listenerAttached = true;
  }
};
const detachResizeListener = () => {
  if (listenerAttached) {
    window.removeEventListener('resize', handleResize);
    listenerAttached = false;
  }
};

onMounted(() => {
  if (customizer.miniSidebar) {
    handleResize();
    attachResizeListener();
  }
});

watch(
  () => customizer.miniSidebar,
  (mini) => {
    if (mini) {
      handleResize();
      attachResizeListener();
    } else {
      detachResizeListener();
    }
  }
);

onBeforeUnmount(() => {
  detachResizeListener();
});
</script>

<template>
  <v-navigation-drawer
    left
    v-model="customizer.sidebarDrawer"
    elevation="0"
    rail-width="90"
    mobile-breakpoint="lg"
    app
    class="leftSidebar"
    width="279"
    :rail="customizer.miniSidebar"
    expand-on-hover
  >
    <!---Logo part -->

    <div class="pa-5">
      <Logo />
    </div>
    <!-- ---------------------------------------------- -->
    <!---Navigation -->
    <!-- ---------------------------------------------- -->
    <perfect-scrollbar class="scrollnavbar">
      <v-list aria-busy="true" class="px-2" aria-label="menu list">
        <!---Menu Loop -->
        <template v-for="(item, i) in sidebarMenu" :key="i">
          <!---Item Sub Header -->
          <NavGroup :item="item" v-if="item.header" :key="item.title" />
          <!---Item Divider -->
          <v-divider class="my-3" v-else-if="item.divider" />
          <!---If Has Child -->
          <NavCollapse class="leftPadding" :item="item" :level="0" v-else-if="item.children" />
          <!---Single Item-->
          <NavItem :item="item" v-else />
          <!---End Single Item-->
        </template>
      </v-list>
      <div class="pa-4">
        <ExtraBox />
      </div>
    </perfect-scrollbar>
  </v-navigation-drawer>
</template>
