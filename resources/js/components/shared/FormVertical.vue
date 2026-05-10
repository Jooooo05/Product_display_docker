<template>
  <v-label class="mb-2">{{ label }}</v-label>
  <slot></slot>
</template>

<script>
export default {
  name: 'FormVertical',
  props: {
    label: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>