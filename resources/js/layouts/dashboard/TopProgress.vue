<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { useCustomizerStore } from '@/stores/customizer';

let suppressUntil = 0;
const suppressToken = ref(0);
const customizer = useCustomizerStore();
const display = useDisplay();
let vv: VisualViewport | null = null;
const isTouchSupported = ref(false);

watch(() => display.mdAndDown.value, (isMobile) => {
  if (isMobile) {
    setSuppress(2500); // Suppress pull-to-refresh for 2.5s when layout switches to mobile
  }
});

function hasActiveOverlay() {
  return !!document.querySelector('.v-overlay--active');
}

function isLoginPage() {
  return !!document.querySelector('.loginBox') && !!document.querySelector('.viewport-container');
}

function isSidebarBlocking() {
  return customizer.sidebarDrawer && !isLoginPage();
}

function isTextInputFocused() {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea') return true;
  return el.isContentEditable === true;
}

function isMobileDevice() {
  // Use Vuetify's built-in breakpoint detection for accurate mobile/tablet checking
  // `display.mdAndDown.value` is true for phones (xs) and tablets (sm, md)
  // And only render pull-to-refresh if the device actually supports touch interactions
  return display.mdAndDown.value && isTouchSupported.value;
}

function isInLoginBox(el: HTMLElement | null) {
  if (!el) return false;
  const container = document.querySelector('.loginBox');
  return !!container && !!el.closest('.loginBox');
}

function setSuppress(ms: number) {
  suppressUntil = Date.now() + ms;
  suppressToken.value++;
  window.setTimeout(() => {
    suppressToken.value++;
  }, ms + 32);
}

function onGlobalClick(e: MouseEvent) {
  if (!isLoginPage()) return;
  if (!isMobileDevice()) return;
  const target = e.target as HTMLElement | null;
  if (!target) return;
  if (!isInLoginBox(target)) return;
  const isBtn = !!target.closest('button, input[type="submit"], .v-btn');
  if (isBtn) setSuppress(1500);
}

function onGlobalKeydown(e: KeyboardEvent) {
  if (!isLoginPage()) return;
  if (!isMobileDevice()) return;
  if (e.key === 'Enter' && isTextInputFocused()) setSuppress(1500);
}

function onGlobalFocusout(e: FocusEvent) {
  if (!isLoginPage()) return;
  if (!isMobileDevice()) return;
  const target = e.target as HTMLElement | null;
  if (!target) return;
  const tag = target.tagName.toLowerCase();
  if (isInLoginBox(target) && (tag === 'input' || tag === 'textarea')) setSuppress(1200);
}

function onVVChange() {
  if (!isLoginPage()) return;
  if (!isMobileDevice()) return;
  setSuppress(1200);
}

function onWindowResize() {
  setSuppress(1500);
}

const disabled = computed(() => {
  const now = Date.now() + suppressToken.value * 0;
  if (!isMobileDevice()) return true;
  if (hasActiveOverlay()) return true;
  if (isSidebarBlocking()) return true;
  if (isLoginPage() && isMobileDevice() && isTextInputFocused()) return true;
  if (isMobileDevice() && now < suppressUntil) return true;
  return false;
});

async function onLoad(payload: { done: () => void }) {
  const done = payload.done;
  if (disabled.value) return done();

  if (isLoginPage()) {
    done();
    location.reload();
    return;
  }

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    window.removeEventListener('softrefresh-done', finish);
    done();
  };

  window.addEventListener('softrefresh-done', finish);
  window.dispatchEvent(new Event('softrefresh'));

  window.setTimeout(() => {
    if (finished) return;
    finish();
    location.reload();
  }, 2500);
}

onMounted(() => {
  isTouchSupported.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  window.addEventListener('resize', onWindowResize, { passive: true });
  window.addEventListener('click', onGlobalClick, { capture: true });
  window.addEventListener('keydown', onGlobalKeydown, { capture: true });
  window.addEventListener('focusout', onGlobalFocusout, { capture: true });
  vv = window.visualViewport;
  if (vv) {
    vv.addEventListener('resize', onVVChange, { passive: true });
    vv.addEventListener('scroll', onVVChange, { passive: true });
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize);
  window.removeEventListener('click', onGlobalClick, true);
  window.removeEventListener('keydown', onGlobalKeydown, true);
  window.removeEventListener('focusout', onGlobalFocusout, true);
  if (vv) {
    vv.removeEventListener('resize', onVVChange);
    vv.removeEventListener('scroll', onVVChange);
    vv = null;
  }
});
</script>

<template>
  <v-pull-to-refresh v-if="isMobileDevice()" :pull-down-threshold="80" @load="onLoad" class="flex-grow-1 d-flex flex-column h-100 w-100">
    <template #pullDownPanel="{ canRefresh, refreshing }">
      <div class="d-flex justify-center align-center w-100 py-3" style="min-height: 30px;">
        <v-progress-circular
          v-if="refreshing"
          indeterminate
          color="primary"
          size="24"
          width="2"
        ></v-progress-circular>
        <v-progress-circular
          v-else-if="canRefresh"
          :model-value="100"
          color="primary"
          size="24"
          width="2"
        ></v-progress-circular>
        <v-progress-circular
          v-else
          :model-value="50"
          color="primary"
          size="24"
          width="2"
        ></v-progress-circular>
      </div>
    </template>

    <slot />
  </v-pull-to-refresh>
  <slot v-else />
</template>
