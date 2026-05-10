<script setup lang="ts">
import { ref, computed } from 'vue';
import { mdiRotateLeft, mdiRotateRight, mdiMagnifyPlus, mdiMagnifyMinus, mdiDownload, mdiFileRestore } from '@mdi/js';
import UiParentCard from './UiParentCard.vue';

const props = defineProps({
  imageUrl: {
    type: String,
    required: true
  },
  imageName: {
    type: String,
    default: 'Image'
  },
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const scale = ref(1);
const rotate = ref(0);
const translateX = ref(0);
const translateY = ref(0);
const maxZoom = 3;
const minZoom = 0.5;
const zoomStep = 0.1;
const rotationStep = 90;

// Drag functionality
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);

const imageStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) rotate(${rotate.value}deg) scale(${scale.value})`,
  transition: isDragging.value ? 'none' : 'transform 0.3s'
}));

const zoomIn = () => {
  scale.value = Math.min(Math.max(scale.value + zoomStep, minZoom), maxZoom);
};

const zoomOut = () => {
  scale.value = Math.min(Math.max(scale.value - zoomStep, minZoom), maxZoom);
};

const btn_rotate = (angle: number) => {
  rotate.value += angle;
};

const rotateLeft = () => {
  btn_rotate(-rotationStep);
};

const rotateRight = () => {
  btn_rotate(rotationStep);
};

const onZoom = (event: WheelEvent) => {
  event.preventDefault();
  const zoomFactor = event.deltaY < 0 ? zoomStep : -zoomStep;
  scale.value = Math.min(Math.max(scale.value + zoomFactor, minZoom), maxZoom);
};

const resetTransform = () => {
  scale.value = 1;
  rotate.value = 0;
  translateX.value = 0;
  translateY.value = 0;
};

const resetImg = () => {
  rotate.value = 0;
  scale.value = 1;
};

// Drag event handlers
const startDragging = (event: MouseEvent) => {
  event.preventDefault();
  isDragging.value = true;
  startX.value = event.clientX - translateX.value;
  startY.value = event.clientY - translateY.value;
  document.addEventListener('mousemove', onDrag, { passive: false });
  document.addEventListener('mouseup', stopDragging);
  document.addEventListener('mouseleave', stopDragging);
};

const onDrag = (event: MouseEvent) => {
  if (!isDragging.value) return;
  event.preventDefault();
  
  const newTranslateX = event.clientX - startX.value;
  const newTranslateY = event.clientY - startY.value;
  
  // Apply boundary constraints to prevent getting stuck
  const maxTranslate = 200; // Maximum translation distance
  
  translateX.value = Math.max(-maxTranslate, Math.min(maxTranslate, newTranslateX));
  translateY.value = Math.max(-maxTranslate, Math.min(maxTranslate, newTranslateY));
};

const stopDragging = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDragging);
  document.removeEventListener('mouseleave', stopDragging);
};

const downloadImg = (file: string) => {
  const link = document.createElement('a');
  link.href = props.imageUrl;
  link.setAttribute('download', file || props.imageName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadImage = () => {
  downloadImg(props.imageName);
};


const closeDialog = () => {
  emit('update:modelValue', false);
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="closeDialog" max-width="800px" scrollable>
    <UiParentCard :title="imageName" actionClass="d-flex justify-center">
      <template #action>
        <v-btn icon variant="text" color="error" @click="closeDialog">
           <SvgSprite name="custom-close" style="width: 18px; height: 18px; transform: rotate(45deg)" />
        </v-btn>
      </template>
      
      <div class="image-container">
        <img 
          :src="imageUrl" 
          :alt="imageName"
          :style="imageStyle"
          @mousedown="startDragging"
          @wheel="onZoom"
          @dragstart.prevent
          draggable="false"
        />
      </div>
      
      <template #footer>
        <v-btn color="primary" variant="tonal" icon @click="rotateLeft">
          <svg-icon type="mdi" :path="mdiRotateLeft"></svg-icon>
        </v-btn>
        
        <v-btn color="primary" variant="tonal" icon @click="rotateRight">
          <svg-icon type="mdi" :path="mdiRotateRight"></svg-icon>
        </v-btn>
        
        <v-btn color="primary" variant="tonal" icon @click="zoomOut" :disabled="scale <= minZoom">
          <svg-icon type="mdi" :path="mdiMagnifyMinus"></svg-icon>
        </v-btn>
        
        <v-btn color="primary" variant="tonal" icon @click="zoomIn" :disabled="scale >= maxZoom">
          <svg-icon type="mdi" :path="mdiMagnifyPlus"></svg-icon>
        </v-btn>
        
        <v-btn color="primary" variant="tonal" icon @click="resetTransform">
          <svg-icon type="mdi" :path="mdiFileRestore"></svg-icon>
        </v-btn>
        
        <v-btn color="primary" variant="tonal" icon @click="downloadImage">
          <svg-icon type="mdi" :path="mdiDownload"></svg-icon>
        </v-btn>
      </template>
    </UiParentCard>
  </v-dialog>
</template>

<style scoped>
.image-container {
    position: relative;
    width: 100%;
    height: 500px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgb(var(--v-theme-dark));
    touch-action: none;
}

.image-container img {
    max-width: 100%;
    max-height: 100%;
    user-select: none;
    cursor: grab;
    pointer-events: auto;
}

.image-container img:active {
    cursor: grabbing;
}

.image-container img.dragging {
    cursor: grabbing;
    pointer-events: none;
}
</style>
