<template>
    <div class="product-grid" >
        <v-skeleton-loader
            v-for="i in count"
            :key="i"
            type="image, list-item-two-line"
            rounded="lg"
        />
    </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    count?: number
}>(), {
    count: 6,
    showFilter: false
})
</script>