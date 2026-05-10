<script setup lang="ts">
interface Props {
  label: string
  value?: string | number | null
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  emptyText: '-'
})
</script>

<template>
  <v-row class="mb-2">
    <v-col cols="12" sm="4" md="3" class="d-flex align-center pb-0 pb-sm-3">
      <v-label class="font-weight-bold text-body-2 text-sm-body-1">{{ label }} :</v-label>
    </v-col>
    <v-col cols="12" sm="8" md="9" class="pt-1 pt-sm-3">
      <div class="text-body-2 text-sm-body-1">
        <slot />
      </div>
    </v-col>
  </v-row>
</template>

