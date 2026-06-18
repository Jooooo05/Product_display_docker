<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDashboardStore } from '@/stores/dashboard/dashboard-store'; 
import SvgSprite from '@/components/shared/SvgSprite.vue';

const store = useDashboardStore();

const tab = ref('all');
const loading = computed(() => store.loadingProducts);
const products = computed(() => store.products);
const currentPage = computed(() => store.currentPage);
const lastPage = computed(() => store.lastPage);

// ─── Tab config ───────────────────────────────────────────────────────────────
const tabs = [
    { value: 'all',      label: 'All',      status: '' },
    { value: 'active',   label: 'Active',   status: 'Active' },
    { value: 'inactive', label: 'Inactive', status: 'Inactive' },
    { value: 'draft',    label: 'Draft',    status: 'Draft' },
];

// ─── Tab change → update filter di store ─────────────────────────────────────
function onTabChange(value: string) {
    tab.value = value;
    const selected = tabs.find(t => t.value === value);
    store.setFilter('status', selected?.status ?? '');
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function onPageChange(page: number) {
    store.fetchProducts(page);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const stockColor: Record<string, string> = {
    available:    'success',
    low_stock:    'warning',
    out_of_stock: 'error',
};

const stockLabel: Record<string, string> = {
    available:    'Available',
    low_stock:    'Low Stock',
    out_of_stock: 'Out of Stock',
};

const statusColor: Record<string, string> = {
    Active:   'success',
    Inactive: 'error',
    Draft:    'warning',
};

function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);
}

// ─── Initial load ─────────────────────────────────────────────────────────────
onMounted(() => {
    if (!products.value.length) {
        store.fetchProducts(1);
    }
});
</script>

<template>
    <v-card variant="outlined" class="bg-surface" rounded="lg">

        <!-- Header -->
        <v-card-text class="pb-2">
            <div class="d-flex justify-space-between align-center">
                <h5 class="text-h5 mb-0">Recent Products</h5>
                <v-chip
                    v-if="store.alertProductCount > 0"
                    color="error"
                    variant="tonal"
                    size="small"
                    rounded="md"
                >
                    {{ store.alertProductCount }} stock alert
                </v-chip>
            </div>
        </v-card-text>

        <!-- Tabs filter by status -->
        <v-tabs v-model="tab" color="primary" class="px-6">
            <v-tab
                v-for="t in tabs"
                :key="t.value"
                :value="t.value"
                class="font-weight-medium"
                @click="onTabChange(t.value)"
            >
                {{ t.label }}
            </v-tab>
        </v-tabs>
        <v-divider />

        <!-- Product list -->
        <v-card-item class="pa-0">
            <!-- Loading state -->
            <div v-if="loading" class="pa-4">
                <v-skeleton-loader
                    v-for="n in 5"
                    :key="n"
                    type="list-item-avatar-two-line"
                    class="mb-2"
                />
            </div>

            <!-- Empty state -->
            <div
                v-else-if="!products.length"
                class="pa-8 text-center text-medium-emphasis"
            >
                <SvgSprite name="custom-page-outline" style="width: 40px; height: 40px; opacity: 0.4" />
                <p class="text-body-1 mt-3 mb-0">No products found</p>
            </div>

            <!-- List -->
            <v-list v-else border rounded="lg" class="py-0" aria-busy="true" aria-label="recent products">
                <v-list-item
                    v-for="product in products"
                    :key="product.id"
                    class="py-3 px-6"
                >
                    <!-- Avatar / image -->
                    <template v-slot:prepend>
                        <v-avatar size="42" rounded="md" color="containerBg" variant="tonal">
                            <v-img
                                v-if="product.image_url"
                                :src="product.image_url"
                                :alt="product.name"
                                cover
                            />
                            <SvgSprite
                                v-else
                                name="custom-page-outline"
                                style="width: 20px; height: 20px; opacity: 0.5"
                            />
                        </v-avatar>
                    </template>

                    <!-- Name & categories -->
                    <h6 class="text-subtitle-1 mb-0 text-truncate" style="max-width: 280px">
                        {{ product.name }}
                    </h6>
                    <div class="d-flex align-center gap-1 mt-1 flex-wrap">
                        <span class="text-caption text-medium-emphasis me-1">
                            {{ product.sku ?? '—' }}
                        </span>
                        <v-chip
                            v-for="cat in product.categories"
                            :key="cat.id"
                            size="x-small"
                            rounded="sm"
                            variant="tonal"
                            color="primary"
                        >
                            {{ cat.name }}
                        </v-chip>
                    </div>

                    <!-- Price, status, stock chips -->
                    <template v-slot:append>
                        <div class="text-end">
                            <!-- Original price -->
                            <h6 class="text-subtitle-1 mb-1">
                                {{ formatPrice(product.original_price) }}
                            </h6>
                            <div class="d-flex align-center justify-end gap-1 flex-wrap">
                                <!-- Status chip -->
                                <v-chip
                                    size="x-small"
                                    rounded="sm"
                                    variant="tonal"
                                    :color="statusColor[product.status]"
                                >
                                    {{ product.status }}
                                </v-chip>
                                <!-- Stock chip -->
                                <v-chip
                                    size="x-small"
                                    rounded="sm"
                                    variant="tonal"
                                    :color="stockColor[product.stock_status]"
                                >
                                    {{ stockLabel[product.stock_status] }}
                                </v-chip>
                                <!-- Discount badge -->
                                <v-chip
                                    v-if="product.discount_percent"
                                    size="x-small"
                                    rounded="sm"
                                    variant="flat"
                                    color="primary"
                                >
                                    -{{ product.discount_percent }}%
                                </v-chip>
                            </div>
                        </div>
                    </template>
                </v-list-item>
            </v-list>

            <v-divider />

            <!-- Footer: pagination -->
            <div class="pa-4 d-flex justify-space-between align-center flex-wrap gap-2">
                <p class="text-body-2 text-medium-emphasis mb-0">
                    Page {{ currentPage }} of {{ lastPage }}
                </p>
                <v-pagination
                    v-model="currentPage"
                    :length="lastPage"
                    :total-visible="5"
                    density="compact"
                    rounded="md"
                    @update:model-value="onPageChange"
                />
            </div>
        </v-card-item>
    </v-card>
</template>