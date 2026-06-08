<script setup>
import { ref, onMounted, computed } from "vue";
import { useProductStore } from "@/stores/product-management/product-store.js";
import ProductTab from "./ProductTab.vue";
import { useAuthStore } from "@/stores/auth.js";

const props = defineProps({
    id: {
        type: Number,
        required: true,
    },
    mode: {
        type: String,
        default: 'admin', // 'admin' | 'public'
    }
});
const authStore = useAuthStore();
const isLoggedIn = computed(() => !!authStore.token && !!authStore.user);
const isDealer = computed(() => isLoggedIn.value && !!authStore.user?.is_dealer);
const isAdmin = computed(() => isLoggedIn.value && !authStore.user?.is_dealer);

const store = useProductStore();
const appUrl = import.meta.env.VITE_APP_URL;
const defaultImage = '/assets/images/placeholder_image.jpg';
const product = ref(null);

const productImageUrl = computed(() => {
    if (!product.value?.image) return defaultImage;
    return `${appUrl}/storage/${product.value.image}`;
});

const discountPercent = computed(() => {
    if (!product.value?.original_price || !product.value?.dealer_price) return null;
    const diff = product.value.original_price - product.value.dealer_price;
    if (diff <= 0) return null;
    return Math.round((diff / product.value.original_price) * 100);
});

const categoryNames = computed(() => {
    return product.value?.categories?.map(c => c.name).join(', ') || '-';
});

const formatPrice = (val) => {
    if (!val) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};

const formatDate = (val) => {
    if (!val) return '-';
    return new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

onMounted(async () => {
    product.value = await store.fetchProduct(props.id);
});
</script>

<template>
    <div v-if="product">

        <!-- ===== ADMIN MODE ===== -->
        <template v-if="mode === 'admin'">
            <v-row>
                <v-col cols="12" md="3">
                    <v-card variant="outlined" rounded="lg" class="overflow-hidden">
                        <v-img
                            :src="productImageUrl"
                            :alt="product.name"
                            aspect-ratio="4/3"
                            cover
                            class="bg-grey-lighten-3"
                        />
                    </v-card>
                </v-col>

                <v-col cols="12" md="9">
                    <!-- Name + badges -->
                    <div class="d-flex align-center flex-wrap gap-2 mb-3">
                        <h3 class="text-h5 font-weight-medium flex-grow-1">{{ product.name }}</h3>
                        <v-chip color="info" variant="tonal" size="small">{{ product.status }}</v-chip>
                        <v-chip color="success" variant="tonal" size="small">{{ product.stock_status }}</v-chip>
                    </div>

                    <!-- Price cards -->
                    <v-row class="mb-3" dense>
                        <v-col cols="6">
                            <div class="price-meta-card">
                                <span class="meta-label">Dealer price</span>
                                <span class="text-subtitle-1 font-weight-medium">{{ formatPrice(product.dealer_price) }}</span>
                            </div>
                        </v-col>
                        <v-col cols="6">
                            <div class="price-meta-card">
                                <span class="meta-label">Original price</span>
                                <span class="text-subtitle-1 text-medium-emphasis text-decoration-line-through">{{ formatPrice(product.original_price) }}</span>
                            </div>
                        </v-col>
                    </v-row>

                    <!-- Meta info -->
                    <v-row class="mb-3" dense>
                        <v-col cols="6">
                            <span class="meta-label d-block mb-1">SKU</span>
                            <code class="text-body-2 text-medium-emphasis">{{ product.sku }}</code>
                        </v-col>
                        <v-col cols="6">
                            <span class="meta-label d-block mb-1">Category</span>
                            <span class="text-body-2">{{ categoryNames }}</span>
                        </v-col>
                    </v-row>

                    <v-divider class="mb-3" />

                    <ProductTab
                        :description="product.description"
                        :features="product.features"
                        :specifications="product.specifications"
                    />
                </v-col>
            </v-row>
        </template>

        <!-- ===== PUBLIC MODE ===== -->
        <template v-else>
            <!-- Hero image -->
            <div class="public-image-wrapper mb-6">
                <img :src="productImageUrl" :alt="product.name" class="public-image" />
            </div>

            <div class="px-4 px-md-8">
                <!-- Name + stock -->
                <div class="d-flex align-center flex-wrap gap-2 mb-2">
                    <h1 class="text-h4 font-weight-medium flex-grow-1">{{ product.name }}</h1>
                    <v-chip color="success" variant="tonal" size="small">{{ product.stock_status }}</v-chip>
                </div>

                <!-- Price block -->
                <div class="d-flex align-center gap-3 mb-5">
                    <span v-if="isDealer" class="text-h5 font-weight-medium mr-3">{{ formatPrice(product.dealer_price) }}</span>
                    <span class="text-caption font-weight-bold text-medium-emphasis mr-2" :class="{ 'text-decoration-line-through': isDealer }" >{{ formatPrice(product.original_price) }}</span>
                    <v-chip v-if="discountPercent && isDealer" color="error" variant="tonal" size="x-small">
                        -{{ discountPercent }}%
                    </v-chip>
                </div>

                <!-- Meta row -->
                <div class="public-meta-row mb-5">
                    <div>
                        <span class="meta-label d-block mb-1">SKU</span>
                        <code class="text-body-2 text-medium-emphasis">{{ product.sku }}</code>
                    </div>
                    <div>
                        <span class="meta-label d-block mb-1">Category</span>
                        <span class="text-body-2">{{ categoryNames }}</span>
                    </div>
                    <div>
                        <span class="meta-label d-block mb-1">Added</span>
                        <span class="text-body-2">{{ formatDate(product.created_at) }}</span>
                    </div>
                </div>

                <v-divider class="mb-4" />

                <ProductTab
                    :description="product.description"
                    :features="product.features"
                    :specifications="product.specifications"
                />
            </div>
        </template>

    </div>

    <!-- Loading state -->
    <div v-else class="d-flex justify-center align-center" style="min-height: 200px">
        <v-progress-circular indeterminate color="primary" />
    </div>
</template>

<style scoped>
.price-meta-card {
    background: rgba(var(--v-theme-on-surface), 0.04); /* sangat subtle */
    border-radius: 8px;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.meta-label {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgb(var(--v-theme-on-surface), 0.45);
}

.public-image-wrapper {
    width: 100%;
    max-height: 400px;
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    background: rgb(var(--v-theme-surface-variant));
}

.public-image {
    width: 100%;
    height: 400px;
    object-fit: cover;
    display: block;
}

.public-meta-row {
    display: flex;
    gap: 2rem;
    padding: 14px 0;
    border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    flex-wrap: wrap;
}

code {
    font-family: monospace;
    font-size: 13px;
}
</style>