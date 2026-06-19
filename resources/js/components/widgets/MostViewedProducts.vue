<script setup lang="ts">
import { computed } from 'vue';
import { useDashboardStore } from '@/stores/dashboard/dashboard-store';
import SvgSprite from '@/components/shared/SvgSprite.vue';

const store = useDashboardStore();

const products = computed(() => store.mostViewedProducts ?? []);
const loading  = computed(() => store.loadingStats);

const statusColor: Record<string, string> = {
    Active:   'success',
    Inactive: 'error',
    Draft:    'warning',
};
</script>

<template>
    <v-card variant="outlined" class="bg-surface" rounded="lg">

        <!-- Header -->
        <v-card-text class="d-flex align-center justify-space-between py-3 px-5">
            <div class="d-flex align-center gap-2">
                <v-avatar variant="tonal" color="primary" rounded="md" size="36">
                    <SvgSprite name="custom-rise-outline" style="width: 18px; height: 18px" />
                </v-avatar>
                <span class="text-subtitle-1 font-weight-medium">Most Viewed Products</span>
            </div>
            <v-chip size="small" color="primary" variant="tonal" rounded="md">Top 5</v-chip>
        </v-card-text>

        <v-divider />

        <!-- Loading -->
        <div v-if="loading" class="pa-4">
            <v-skeleton-loader
                v-for="n in 5"
                :key="n"
                type="list-item-avatar"
                class="mb-2"
            />
        </div>

        <!-- Empty -->
        <div v-else-if="!products.length" class="pa-8 text-center text-medium-emphasis">
            <SvgSprite name="custom-page-outline" style="width: 36px; height: 36px; opacity: 0.4" />
            <p class="text-body-2 mt-2 mb-0">No views recorded yet</p>
        </div>

        <!-- List -->
        <v-list v-else class="py-0" aria-label="most viewed products">
            <template v-for="(product, index) in products" :key="product.id">
                <v-list-item class="py-3 px-5">

                    <!-- Rank number -->
                    <template v-slot:prepend>
                        <div class="d-flex align-center gap-3">
                            <span
                                class="text-h6 font-weight-bold"
                                :class="index === 0 ? 'text-warning' : 'text-medium-emphasis'"
                                style="width: 20px; text-align: center"
                            >
                                {{ index + 1 }}
                            </span>
                            <v-avatar size="40" rounded="md" color="containerBg" variant="tonal">
                                <v-img
                                    v-if="product.image_url"
                                    :src="product.image_url"
                                    :alt="product.name"
                                    cover
                                />
                                <SvgSprite
                                    v-else
                                    name="custom-page-outline"
                                    style="width: 18px; height: 18px; opacity: 0.4"
                                />
                            </v-avatar>
                        </div>
                    </template>

                    <!-- Name & categories -->
                    <h6 class="text-subtitle-2 mb-0 text-truncate" style="max-width: 200px">
                        {{ product.name }}
                    </h6>
                    <div class="d-flex align-center gap-1 mt-1 flex-wrap">
                        <v-chip
                            v-for="cat in product.categories"
                            :key="cat.id"
                            size="x-small"
                            color="primary"
                            variant="tonal"
                            rounded="sm"
                        >
                            {{ cat.name }}
                        </v-chip>
                    </div>

                    <!-- View count + status -->
                    <template v-slot:append>
                        <div class="text-end">
                            <div class="d-flex align-center gap-1 justify-end mb-1">
                                <SvgSprite name="custom-rise-outline" style="width: 14px; height: 14px; opacity: 0.6" />
                                <span class="text-subtitle-2 font-weight-bold">
                                    {{ product.view_count.toLocaleString('id-ID') }}
                                </span>
                            </div>
                            <v-chip
                                size="x-small"
                                :color="statusColor[product.status]"
                                variant="tonal"
                                rounded="sm"
                            >
                                {{ product.status }}
                            </v-chip>
                        </div>
                    </template>
                </v-list-item>

                <v-divider v-if="index < products.length - 1" />
            </template>
        </v-list>

    </v-card>
</template>