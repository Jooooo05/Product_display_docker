<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance, watch } from "vue";
import { orderBy } from "lodash";
import ProductItem from "./ProductItem.vue";
import { useProductStore } from "@/stores/product-management/product-store";
import { useCategoryStore } from "@/stores/category-management/categories-store.js";
import { useRouter } from 'vue-router';
const { appContext } = getCurrentInstance()!
const filters = appContext.config.globalProperties.filters

const router = useRouter();

// STORES
const productStore = useProductStore();
const categoryStore = useCategoryStore();

// ─── State ────────────────────────────────────────────────────────────────────
const sortOptions = ["Price: Low to High", "Price: High to Low", "Popularity", "Fresh Arrivals"];
const selectedSort = ref("Price: Low to High");
const searchValue = ref("");
const showFilter = ref(true);

// paginate
const currentPage = ref(1);
const perPage = 20;
const totalItems = ref(0); // nanti diisi dari response API

const filterForm = ref({
    categories: [],
    priceMin: null as number | null,
    priceMax: null as number | null,
})

const onPriceInput = (field: "priceMin" | "priceMax", event: Event) => {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/[^0-9]/g, "");
    filterForm.value[field] = raw === "" ? null : Number(raw);
}

// function applyFilters sementara
const applyFilters = async () => {
    currentPage.value = 1;
    await productStore.fetchProducts(1, filterForm.value);
}
// ─── Filtering & Sorting ──────────────────────────────────────────────────────
const filteredProducts = computed(() => {
    let list = [...productStore.listItems];

    if (selectedSort.value === "Popularity") {
        list = orderBy(list, ["rating"], ["desc"]);
    } else if (selectedSort.value === "Price: High to Low") {
        list = orderBy(list, ["salePrice"], ["desc"]);
    } else if (selectedSort.value === "Price: Low to High") {
        list = orderBy(list, ["salePrice"], ["asc"]);
    } else if (selectedSort.value === "Fresh Arrivals") {
        list = orderBy(list, ["id"], ["desc"]);
    }

    const q = searchValue.value.toLowerCase().trim();
    if (q) {
        list = list.filter(
            (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
        );
    }

    return list;
});

const actionItems = [
  { title: 'Edit',   action: 'edit' },
  { title: 'Delete', action: 'delete', color: 'error' },
]


const handleAction = ({ action, id }: { action: string; id: number | string }) => {
  switch (action) {
    case 'edit':
      console.log('edit', id)
      // navigasi atau buka dialog edit
      router.push(`/product/${id}/edit`)
      break
    case 'delete':
      console.log('delete', id);
        productStore.deleteProduct(Number(id));
      // panggil productStore.deleteProduct(id)
      break
  }
}

// Watch perubahan page → fetch ulang
watch(currentPage, async (newPage) => {
    await productStore.fetchProducts(newPage, filterForm.value);
});


onMounted(async () => {
    console.log("ProductListing component mounted");
    await categoryStore.fetchCategories();
    await productStore.fetchProducts(1);

    console.log('totalItems:', productStore.totalItems);
    console.log('lastPage:', productStore.lastPage);
});
</script>

<template>
    <!-- ── Toolbar ──────────────────────────────────────────────── -->
    <v-card variant="outlined" rounded="lg" class="mb-5 px-2">
        <v-card-text class="py-2">
            <div class="d-flex align-center justify-space-between flex-wrap ga-2">

                <!-- Left: Filter toggle + Search -->
                <div class="d-flex align-center ga-2 flex-wrap">
                    <v-btn
                        variant="text"
                        rounded="md"
                        color="default"
                        @click="showFilter = !showFilter"
                    >
                        <SvgSprite name="custom-filter" style="width: 16px; height: 16px" /> filter
                    </v-btn>

                    <v-text-field
                        v-model="searchValue"
                        placeholder="Search products…"
                        variant="outlined"
                        density="compact"
                        hide-details
                        rounded="md"
                        prepend-inner-icon="mdi-magnify"
                        style="min-width: 200px; max-width: 240px"
                    />
                </div>

                <!-- Right: Result count + Slot actions + Sort -->
                <div class="d-flex align-center ga-2 flex-wrap">
                    <span class="text-caption text-medium-emphasis">
                        {{ productStore.totalItems }} products
                    </span>

                    
                    <v-select
                        v-model="selectedSort"
                        :items="sortOptions"
                        variant="outlined"
                        density="compact"
                        hide-details
                        rounded="md"
                        style="min-width: 180px; max-width: 200px"
                    />

                    

                    <!-- Slot actions opsional (e.g. tombol Create Product) -->
                    <slot name="actions" />
                </div>

            </div>
        </v-card-text>
    </v-card>

    <!-- ── Body ─────────────────────────────────────────────────── -->
    <div class="d-flex align-start ga-4">

        <!-- Sidebar Filter -->
        <v-card v-if="showFilter" variant="outlined" rounded="lg" class="filter-sidebar flex-shrink-0">
            <v-card-text>

                <!-- Category -->
                <p class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-1">Category</p>

                <v-autocomplete
                    v-model="filterForm.categories"
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
                    class="mb-4"
                >
                    <template v-slot:chip="{ props, item }">
                        <v-chip
                            v-bind="props"
                            color="primary"
                            variant="tonal"
                            size="small"
                        >
                            {{ item.raw.name }}
                        </v-chip>
                    </template>
                </v-autocomplete>

                <v-divider class="my-4" />
                <!-- Price Range -->
                <p class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-1">Price Range</p>
                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            :model-value="filters.formatNumber(filterForm.priceMin)"
                            @input="onPriceInput('priceMin', $event)"
                            placeholder="Min"
                            variant="outlined"
                            density="comfortable"
                            hide-details
                            rounded="md"
                            prefix="Rp"
                        />
                    </v-col>
                    <v-col cols="12">
                        <v-text-field
                            :model-value="filters.formatNumber(filterForm.priceMax)"
                            @input="onPriceInput('priceMax', $event)"
                            placeholder="Max"
                            variant="outlined"
                            density="comfortable"
                            hide-details
                            rounded="md"
                            prefix="Rp"
                        />
                    </v-col>
                </v-row>


                <v-divider class="my-4" />
                <!-- Button Submit -->
                <v-btn 
                    color="primary" 
                    block 
                    @click="applyFilters">
                    Apply Filters
                </v-btn>
            </v-card-text>
        </v-card>

        <!-- Product Grid -->
        <div class="flex-grow-1" style="min-width: 0">
            <transition-group
                name="fade-list"
                tag="div"
                class="product-grid"
                :class="{ 'grid-wide': !showFilter }"
            >
                <ProductItem
                    v-for="product in filteredProducts"
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

            <!-- Empty State -->
            <div v-if="filteredProducts.length === 0" class="d-flex flex-column align-center justify-center py-16 ga-2">
                <v-icon size="52" color="grey-lighten-2">mdi-package-variant-closed</v-icon>
                <p class="text-subtitle-1 font-weight-medium text-medium-emphasis mb-0">No products found</p>
                <span class="text-caption text-medium-emphasis">Try adjusting your search or filters.</span>
            </div>

            <!-- Pagination -->
            <div v-if="productStore.lastPage > 1" class="d-flex align-center justify-space-between mt-6">
                <span class="text-caption text-medium-emphasis">
                    Showing {{ (currentPage - 1) * 20 + 1 }}–{{ Math.min(currentPage * 20, productStore.totalItems) }} of {{ productStore.totalItems }} products
                </span>
                <v-pagination
                    v-model="currentPage"
                    :length="productStore.lastPage"
                    :total-visible="5"
                    rounded="md"
                    color="primary"
                />
            </div>
        </div>

    </div>
</template>

<style scoped>
/* Sidebar fixed width */
.filter-sidebar {
    width: 220px;
}

/* Product Grid */
.product-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.product-grid.grid-wide {
    grid-template-columns: repeat(4, 1fr);
}

/* Transition animasi tetap */
.fade-list-enter-active,
.fade-list-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-list-enter-from,
.fade-list-leave-to {
    opacity: 0;
    transform: scale(0.97);
}

/* Responsive */
@media (max-width: 900px) {
    .filter-sidebar {
        display: none;
    }
    .product-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 520px) {
    .product-grid {
        grid-template-columns: 1fr;
    }
}
</style>