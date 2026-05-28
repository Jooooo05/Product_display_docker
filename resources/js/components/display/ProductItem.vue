<script setup lang="ts">
import { ref } from "vue";
import { getCurrentInstance } from "vue"
const { appContext } = getCurrentInstance()!
const filters = appContext.config.globalProperties.filters

const appUrl = import.meta.env.VITE_APP_URL;

const props = defineProps<{
    name?: string
    image?: string
    desc?: string
    originalPrice?: number
    dealerPrice?: number
    goto?: number | string
    // ✅ Tambah ini
    actions?: { title: string; action: string; color?: string }[]
}>();

// Gambar default, bisa pakai dari assets lokal atau URL online
const defaultImage = '/assets/images/placeholder_image.jpg';

const emit = defineEmits<{(e: 'action', payload: { action: string; id: number | string }): void }>();
</script>

<template>
    <v-card variant="outlined" rounded="lg" class="product-card bg-surface overflow-hidden" style="position: relative">

        <!-- Image Area -->
        <router-link :to="`/ecommerce/product/detail/${goto}`" class="image-wrapper d-block">
            <img :src="image ? `${appUrl}/storage/${image}` : defaultImage" :alt="name" class="product-image" />
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
                <span class="text-subtitle-1 font-weight-bold">{{ filters.formatMoney(dealerPrice) }}</span>
                <span class="text-caption text-medium-emphasis text-decoration-line-through">{{ filters.formatMoney(originalPrice, false, false, 0) }}</span>
            </div>
        </v-card-text>

        <!-- ✅ Tambah blok ini -->
        <template v-if="actions?.length">
            <v-menu location="bottom end">
                <template #activator="{ props: menuProps }">
                    <v-btn
                        icon
                        variant="flat"
                        color="surface"
                        density="comfortable"
                        v-bind="menuProps"
                        rounded="md"
                        style="position: absolute; top: 8px; right: 8px"
                        @click.stop
                    >
                        <SvgSprite name="custom-more-outline" style="width: 16px; height: 16px; transform: rotate(90deg)" />
                    </v-btn>
                </template>

                <v-list rounded="md" class="py-1" min-width="140">
                    <v-list-item
                        v-for="(item, i) in actions"
                        :key="i"
                        class="py-1 px-3"
                        :class="item.color ? `text-${item.color}` : ''"
                        @click="emit('action', { action: item.action, id: goto! })"
                    >
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </template>

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