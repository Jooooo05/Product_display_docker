<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { orderBy } from "lodash";
import ProductItem from "./ProductItem.vue";
import { useProductStore } from "@/stores/product-management/product-store";

// ─── Dummy Data ───────────────────────────────────────────────────────────────
// const dummyProducts = [
//     {
//         id: 1,
//         name: "Nikon Coolpix B500",
//         description: "Point and shoot camera with 40x optical zoom and built-in Wi-Fi connectivity.",
//         salePrice: 15,
//         offerPrice: 20,
//         rating: 0.5,
//         image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
//         categories: ["electronics"],
//         gender: "kids",
//     },
//     {
//         id: 2,
//         name: "Apple MacBook Air",
//         description: "Lightweight laptop featuring Apple M2 chip, stunning Retina display, and all-day battery.",
//         salePrice: 16,
//         offerPrice: 14,
//         rating: 1.5,
//         image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&q=80",
//         categories: ["electronics"],
//         gender: "male",
//     },
//     {
//         id: 3,
//         name: "Luxury Silver Watch",
//         description: "Swiss-made automatic movement with sapphire crystal and stainless steel bracelet.",
//         salePrice: 36,
//         offerPrice: 29,
//         rating: 2.3,
//         image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
//         categories: ["fashion"],
//         gender: "male",
//     },
//     {
//         id: 4,
//         name: "Smart Watch Pro",
//         description: "Feature-rich smartwatch with health tracking, GPS, and 7-day battery life.",
//         salePrice: 85,
//         offerPrice: 49,
//         rating: 2.5,
//         image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80",
//         categories: ["electronics"],
//         gender: "female",
//     },
//     {
//         id: 5,
//         name: "Wireless Headphones",
//         description: "Premium noise-cancelling headphones with 30-hour battery and Hi-Res audio support.",
//         salePrice: 45,
//         offerPrice: 60,
//         rating: 4.2,
//         image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
//         categories: ["electronics"],
//         gender: "kids",
//     },
//     {
//         id: 6,
//         name: "Running Sneakers",
//         description: "Lightweight performance trainers with responsive cushioning and breathable mesh upper.",
//         salePrice: 62,
//         offerPrice: 79,
//         rating: 3.8,
//         image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
//         categories: ["fashion"],
//         gender: "female",
//     },
//     {
//         id: 7,
//         name: "Leather Backpack",
//         description: "Handcrafted full-grain leather backpack with padded laptop sleeve and antique brass hardware.",
//         salePrice: 110,
//         offerPrice: 130,
//         rating: 4.7,
//         image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
//         categories: ["fashion"],
//         gender: "male",
//     },
//     {
//         id: 8,
//         name: "Mechanical Keyboard",
//         description: "Compact TKL mechanical keyboard with tactile switches, RGB backlight, and aluminium frame.",
//         salePrice: 89,
//         offerPrice: 105,
//         rating: 4.4,
//         image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80",
//         categories: ["electronics"],
//         gender: "kids",
//     },
// ];

// STORES
const productStore = useProductStore();

// ─── State ────────────────────────────────────────────────────────────────────
const sortOptions = ["Price: Low to High", "Price: High to Low", "Popularity", "Fresh Arrivals"];
const selectedSort = ref("Price: Low to High");
const searchValue = ref("");
const showFilter = ref(true);

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

onMounted(async () => {
    console.log("ProductListing component mounted");
    await productStore.fetchProducts();
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
                        {{ filteredProducts.length }} products
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
                <v-checkbox label="All" density="compact" hide-details color="primary" :model-value="true" />
                <v-checkbox label="Electronics" density="compact" hide-details color="primary" />
                <v-checkbox label="Fashion" density="compact" hide-details color="primary" />

                <v-divider class="my-4" />

                <!-- Price Range -->
                <p class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-1">Price Range</p>
                <v-slider min="0" max="200" color="primary" hide-details class="mt-2" />
                <div class="d-flex justify-space-between mt-n1">
                    <span class="text-caption text-medium-emphasis">$0</span>
                    <span class="text-caption text-medium-emphasis">$200</span>
                </div>

                <v-divider class="my-4" />

                <!-- Rating -->
                <p class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-1">Rating</p>
                <v-checkbox label="4★ & above" density="compact" hide-details color="primary" />
                <v-checkbox label="3★ & above" density="compact" hide-details color="primary" />

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
                    :salePrice="product.original_price ?? undefined"
                    :offerPrice="product.dealer_price ?? undefined"
                    :goto="product.id"
                />
            </transition-group>

            <!-- Empty State -->
            <div v-if="filteredProducts.length === 0" class="d-flex flex-column align-center justify-center py-16 ga-2">
                <v-icon size="52" color="grey-lighten-2">mdi-package-variant-closed</v-icon>
                <p class="text-subtitle-1 font-weight-medium text-medium-emphasis mb-0">No products found</p>
                <span class="text-caption text-medium-emphasis">Try adjusting your search or filters.</span>
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