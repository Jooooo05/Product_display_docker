<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance, watch } from "vue";
import ProductSkeletonLoader from "../shared/ProductSkeletonLoader.vue";
import ProductItem from "./ProductItem.vue";
import { useProductStore } from "@/stores/product-management/product-store";
import { useCategoryStore } from "@/stores/category-management/categories-store.js";
import { useRouter } from "vue-router";

const { appContext } = getCurrentInstance()!;
const filters = appContext.config.globalProperties.filters;
const router = useRouter();

const productStore = useProductStore();
const categoryStore = useCategoryStore();

// ─── State ────────────────────────────────────────────────────────────────────
const searchValue = ref("");
const drawerOpen = ref(false);
const currentPage = ref(1);

const filterForm = ref({
    categories: [] as number[],
    priceMin: null as number | null,
    priceMax: null as number | null,
});

// Form sementara di dalam drawer (apply baru commit ke filterForm)
const draftFilter = ref({
    categories: [] as number[],
    priceMin: null as number | null,
    priceMax: null as number | null,
});

// ─── Drawer open/close ────────────────────────────────────────────────────────
const openDrawer = () => {
    // sync draft dengan filter yang aktif
    draftFilter.value = { ...filterForm.value, categories: [...filterForm.value.categories] };
    drawerOpen.value = true;
};

const closeDrawer = () => {
    drawerOpen.value = false;
};

// ─── Active filter chips ──────────────────────────────────────────────────────
const activeChips = computed(() => {
    const chips: { key: string; label: string }[] = [];

    filterForm.value.categories.forEach((id) => {
        const cat = categoryStore.listItems.find((c: any) => c.id === id);
        if (cat) chips.push({ key: `cat-${id}`, label: cat.name });
    });

    if (filterForm.value.priceMin !== null || filterForm.value.priceMax !== null) {
        const min = filterForm.value.priceMin ? filters.formatNumber(filterForm.value.priceMin) : '0';
        const max = filterForm.value.priceMax ? filters.formatNumber(filterForm.value.priceMax) : '∞';
        chips.push({ key: 'price', label: `Rp ${min} – ${max}` });
    }

    return chips;
});

const activeFilterCount = computed(() => activeChips.value.length);

const removeChip = async (key: string) => {
    if (key.startsWith('cat-')) {
        const id = Number(key.replace('cat-', ''));
        filterForm.value.categories = filterForm.value.categories.filter(c => c !== id);
    } else if (key === 'price') {
        filterForm.value.priceMin = null;
        filterForm.value.priceMax = null;
    }
    currentPage.value = 1;
    await productStore.fetchProducts(1, filterForm.value);
};

const clearAllFilters = async () => {
    filterForm.value = { categories: [], priceMin: null, priceMax: null };
    currentPage.value = 1;
    await productStore.fetchProducts(1, filterForm.value);
};

// ─── Apply filter dari drawer ─────────────────────────────────────────────────
const applyFilters = async () => {
    filterForm.value = { ...draftFilter.value, categories: [...draftFilter.value.categories] };
    currentPage.value = 1;
    closeDrawer();
    await productStore.fetchProducts(1, filterForm.value);
};

// ─── Price input handler ──────────────────────────────────────────────────────
const onPriceInput = (field: "priceMin" | "priceMax", event: Event) => {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/[^0-9]/g, "");
    draftFilter.value[field] = raw === "" ? null : Number(raw);
};

// ─── Actions ──────────────────────────────────────────────────────────────────
const actionItems = [
    { title: "Edit", action: "edit" },
    { title: "Delete", action: "delete", color: "error" },
];

const handleAction = ({ action, id }: { action: string; id: number | string }) => {
    switch (action) {
        case "edit":
            router.push(`/product/${id}/edit`);
            break;
        case "delete":
            productStore.deleteProduct(Number(id));
            break;
    }
};

// ─── Search & pagination watch ────────────────────────────────────────────────
watch(searchValue, (val) => {
    productStore.setSearch(val);
    currentPage.value = 1;
});

watch(currentPage, async (newPage) => {
    await productStore.fetchProducts(newPage, filterForm.value);
});

// ─── Init ─────────────────────────────────────────────────────────────────────
const isReady = ref(false);
onMounted(async () => {
    await categoryStore.fetchCategories();
    await productStore.fetchProducts(1);
    isReady.value = true;
});
</script>

<template>
    <!-- ── Filter Drawer ──────────────────────────────────────────────────────── -->
    <v-navigation-drawer
        v-model="drawerOpen"
        location="left"
        temporary
        width="280"
    >
        <div class="d-flex flex-column" style="height: 100%">
            <!-- Drawer header -->
            <div class="d-flex align-center justify-space-between px-4 py-3" style="border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity))">
                <span class="text-subtitle-2 font-weight-medium">Filter produk</span>
                <v-btn icon variant="text" density="compact" @click="closeDrawer">
                    <SvgSprite name="custom-close" style="width: 16px; height: 16px; transform:rotate(45deg)" />
                </v-btn>
            </div>

            <!-- Drawer body -->
            <div class="flex-grow-1 overflow-y-auto px-4 py-4" style="display: flex; flex-direction: column; gap: 20px;">

                <!-- Category -->
                <div>
                    <p class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-2">Category</p>
                    <v-autocomplete
                        v-model="draftFilter.categories"
                        :items="categoryStore.listItems"
                        item-title="name"
                        item-value="id"
                        variant="outlined"
                        density="comfortable"
                        color="primary"
                        multiple
                        chips
                        closable-chips
                        hide-details
                        placeholder="Select category"
                    >
                        <template v-slot:chip="{ props, item }">
                            <v-chip v-bind="props" color="primary" variant="tonal" size="small">
                                {{ item.raw.name }}
                            </v-chip>
                        </template>
                    </v-autocomplete>
                </div>

                <v-divider />

                <!-- Price range -->
                <div>
                    <p class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-2">Price range</p>
                    <div class="d-flex flex-column ga-3">
                        <v-text-field
                            :model-value="filters.formatNumber(draftFilter.priceMin)"
                            @input="onPriceInput('priceMin', $event)"
                            placeholder="Min"
                            variant="outlined"
                            density="comfortable"
                            hide-details
                            rounded="md"
                            prefix="Rp"
                        />
                        <v-text-field
                            :model-value="filters.formatNumber(draftFilter.priceMax)"
                            @input="onPriceInput('priceMax', $event)"
                            placeholder="Max"
                            variant="outlined"
                            density="comfortable"
                            hide-details
                            rounded="md"
                            prefix="Rp"
                        />
                    </div>
                </div>
            </div>

            <!-- Drawer footer -->
            <div class="px-4 py-3 d-flex flex-column ga-2" style="border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity))">
                <v-btn color="primary" block rounded="md" @click="applyFilters">
                    Apply filters
                </v-btn>
                <v-btn variant="text" block rounded="md" color="default" @click="closeDrawer">
                    Cancel
                </v-btn>
            </div>
        </div>
    </v-navigation-drawer>

    <!-- ── Toolbar ──────────────────────────────────────────────────────────── -->
    <v-card variant="outlined" rounded="lg" class="mb-5 px-2">
        <v-card-text class="py-2">
            <div class="d-flex align-center flex-wrap ga-2">

                <!-- Filter button -->
                <v-btn variant="text" rounded="md" color="default" @click="openDrawer">
                    <SvgSprite name="custom-filter" style="width: 16px; height: 16px" class="mr-1" />
                    Filter
                    <v-badge
                        v-if="activeFilterCount > 0"
                        :content="activeFilterCount"
                        color="primary"
                        inline
                        class="ml-1"
                    />
                </v-btn>

                <!-- Search -->
                <v-text-field
                    v-model="searchValue"
                    placeholder="Search products…"
                    variant="outlined"
                    density="compact"
                    hide-details
                    rounded="md"
                    style="min-width: 250px; max-width: 280px"
                >
                    <template v-slot:prepend-inner>
                        <SvgSprite name="custom-search" class="text-lightText" style="width: 14px; height: 14px" />
                    </template>
                </v-text-field>

                <!-- Active filter chips -->
                <template v-if="activeChips.length > 0">
                    <v-chip
                        v-for="chip in activeChips"
                        :key="chip.key"
                        size="small"
                        color="primary"
                        variant="tonal"
                        closable
                        @click:close="removeChip(chip.key)"
                    >
                        {{ chip.label }}
                    </v-chip>

                    <v-btn
                        variant="text"
                        size="small"
                        color="default"
                        class="text-medium-emphasis"
                        @click="clearAllFilters"
                    >
                        Clear all
                    </v-btn>
                </template>

                <!-- Result count -->
                <span class="text-caption text-medium-emphasis ml-auto">
                    {{ productStore.totalItems }} products
                </span>

                <!-- Slot actions -->
                <slot name="actions" />
            </div>
        </v-card-text>
    </v-card>

    <!-- ── Product Grid ─────────────────────────────────────────────────────── -->
    <ProductSkeletonLoader v-if="!isReady || productStore.loading" :count="6" />

    <transition-group
        v-else
        name="fade-list"
        tag="div"
        class="product-grid"
    >
        <ProductItem
            v-for="product in productStore.listItems"
            :key="product.id"
            :name="product.name ?? undefined"
            :image="product.image ?? undefined"
            :desc="product.description ?? undefined"
            :originalPrice="product.original_price ?? undefined"
            :dealerPrice="product.dealer_price ?? undefined"
            :goto="product.id"
            :actions="actionItems"
            @action="handleAction"
        />
    </transition-group>

    <!-- Empty state -->
    <div
        v-if="isReady && !productStore.loading && productStore.listItems.length === 0"
        class="d-flex flex-column align-center justify-center py-16 ga-2"
    >
        <v-icon size="52" color="grey-lighten-2">mdi-package-variant-closed</v-icon>
        <p class="text-subtitle-1 font-weight-medium text-medium-emphasis mb-0">No products found</p>
        <span class="text-caption text-medium-emphasis">Try adjusting your search or filters.</span>
    </div>

    <!-- Pagination -->
    <div
        v-if="productStore.lastPage > 1"
        class="mt-6 pt-4"
        style="border-top: 1px solid rgba(0, 0, 0, 0.08)"
    >
        <v-pagination
            v-model="currentPage"
            :length="productStore.lastPage"
            :total-visible="4"
            rounded="md"
            color="grey"
        />
    </div>
</template>

<style scoped>
.product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.fade-list-enter-active,
.fade-list-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-list-enter-from,
.fade-list-leave-to {
    opacity: 0;
    transform: scale(0.97);
}

:deep(.v-pagination__list) {
    justify-content: flex-end !important;
}

@media (max-width: 1100px) {
    .product-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 750px) {
    .product-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
    .product-grid { grid-template-columns: 1fr; }
}
</style>