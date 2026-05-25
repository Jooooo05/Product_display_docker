<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
    name:       { type: String,         default: 'Unknown Product' },
    image:      { type: String,         default: '/images/placeholder.png' },
    desc:       { type: String,         default: 'No description available' },
    salePrice:  { type: Number,         default: 0 },
    offerPrice: { type: Number,         default: null },
    goto:       { type: [Number, String], default: '#' },
});
const isInWishlist = ref(false);

function toggleWishlist() {
    isInWishlist.value = !isInWishlist.value;
}
</script>

<template>
    <v-card variant="outlined" rounded="lg" class="product-card bg-surface overflow-hidden">

        <!-- Image Area -->
        <router-link :to="`/ecommerce/product/detail/${goto}`" class="image-wrapper d-block">
            <img :src="image" :alt="name" class="product-image" />
            <div class="image-overlay" />
        </router-link>

        <v-divider />

        <!-- Content -->
        <v-card-item class="pt-3 pb-1">
            <router-link :to="`/ecommerce/product/detail/${goto}`" class="text-decoration-none">
                <v-card-title class="text-subtitle-1 font-weight-semibold text-truncate pa-0">
                    {{ name }}
                </v-card-title>
            </router-link>
            <p class="text-caption text-medium-emphasis desc-clamp mt-1 mb-0">{{ desc }}</p>
        </v-card-item>

        <v-card-text class="pt-2">

            <!-- Price -->
            <div class="d-flex align-center ga-2">
                <span class="text-subtitle-1 font-weight-bold">${{ salePrice }}</span>
                <span class="text-caption text-medium-emphasis text-decoration-line-through">${{ offerPrice }}</span>
            </div>
        </v-card-text>

    </v-card>
</template>

<style scoped>
/* Card hover animation */
.product-card {
    transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.product-card:hover {
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1) !important;
    transform: translateY(-2px);
}

/* Image wrapper */
.image-wrapper {
    position: relative;
    display: block;
    overflow: hidden;
    aspect-ratio: 4 / 3;
}

.product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.35s ease;
}

.product-card:hover .product-image {
    transform: scale(1.05);
}

.image-overlay {
    position: absolute;
    inset: 0;
    background: transparent;
    transition: background 0.2s;
}

.product-card:hover .image-overlay {
    background: rgba(0, 0, 0, 0.02);
}

/* Description clamp */
.desc-clamp {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 36px;
    line-height: 1.5;
}
</style>