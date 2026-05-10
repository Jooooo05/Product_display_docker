<script setup lang="ts">
interface Props {
  label: string
  labelClass?: string
  labelStyle?: string
  required?: boolean
}

withDefaults(defineProps<Props>(), {
  labelClass: 'text-subtitle-1 text-lightText',
  labelStyle: 'font-weight: 500',
  required: false
})
</script>
<template>
  <v-row>
    <v-col cols="12" lg="4" sm="3" class="pb-md-3 pb-0">
      <v-label class="mt-md-4" :style="labelStyle">
        {{ label }}
        <span v-if="required" class="ms-1 requiredColor">*</span>
      </v-label>
    </v-col>
    <v-col cols="12" lg="8" sm="9">
      <slot></slot>
    </v-col>
  </v-row>
</template>

