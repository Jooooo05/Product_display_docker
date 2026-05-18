<script setup lang="ts">
import { ref, computed } from "vue";
import { orderBy } from "lodash";
import ProductItem from "./ProductItem.vue";

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const dummyProducts = [
    {
        id: 1,
        name: "Nikon Coolpix B500",
        description:
            "Point and shoot camera with 40x optical zoom and built-in Wi-Fi connectivity.",
        salePrice: 15,
        offerPrice: 20,
        rating: 0.5,
        image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
        categories: ["electronics"],
        gender: "kids",
    },
    {
        id: 2,
        name: "Apple MacBook Air",
        description:
            "Lightweight laptop featuring Apple M2 chip, stunning Retina display, and all-day battery.",
        salePrice: 16,
        offerPrice: 14,
        rating: 1.5,
        image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&q=80",
        categories: ["electronics"],
        gender: "male",
    },
    {
        id: 3,
        name: "Luxury Silver Watch",
        description:
            "Swiss-made automatic movement with sapphire crystal and stainless steel bracelet.",
        salePrice: 36,
        offerPrice: 29,
        rating: 2.3,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
        categories: ["fashion"],
        gender: "male",
    },
    {
        id: 4,
        name: "Smart Watch Pro",
        description:
            "Feature-rich smartwatch with health tracking, GPS, and 7-day battery life.",
        salePrice: 85,
        offerPrice: 49,
        rating: 2.5,
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80",
        categories: ["electronics"],
        gender: "female",
    },
    {
        id: 5,
        name: "Wireless Headphones",
        description:
            "Premium noise-cancelling headphones with 30-hour battery and Hi-Res audio support.",
        salePrice: 45,
        offerPrice: 60,
        rating: 4.2,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
        categories: ["electronics"],
        gender: "kids",
    },
    {
        id: 6,
        name: "Running Sneakers",
        description:
            "Lightweight performance trainers with responsive cushioning and breathable mesh upper.",
        salePrice: 62,
        offerPrice: 79,
        rating: 3.8,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
        categories: ["fashion"],
        gender: "female",
    },
    {
        id: 7,
        name: "Leather Backpack",
        description:
            "Handcrafted full-grain leather backpack with padded laptop sleeve and antique brass hardware.",
        salePrice: 110,
        offerPrice: 130,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
        categories: ["fashion"],
        gender: "male",
    },
    {
        id: 8,
        name: "Mechanical Keyboard",
        description:
            "Compact TKL mechanical keyboard with tactile switches, RGB backlight, and aluminium frame.",
        salePrice: 89,
        offerPrice: 105,
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80",
        categories: ["electronics"],
        gender: "kids",
    },
];

// ─── State ────────────────────────────────────────────────────────────────────
const sortOptions = [
    "Price: Low to High",
    "Price: High to Low",
    "Popularity",
    "Fresh Arrivals",
];
const selectedSort = ref("Price: Low to High");
const searchValue = ref("");
const showFilter = ref(true);

// ─── Filtering & Sorting ──────────────────────────────────────────────────────
const filteredProducts = computed(() => {
    let list = [...dummyProducts];

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
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q),
        );
    }

    return list;
});
</script>

<template>
    <div class="listing-root">
        <!-- ── Toolbar ─────────────────────────────────────────── -->
        <div class="toolbar">
            <div class="toolbar-left">
                <!-- Filter toggle -->
                <button
                    class="icon-btn"
                    @click="showFilter = !showFilter"
                    :title="showFilter ? 'Hide filters' : 'Show filters'"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                    >
                        <line x1="4" y1="6" x2="20" y2="6" />
                        <line x1="4" y1="12" x2="14" y2="12" />
                        <line x1="4" y1="18" x2="11" y2="18" />
                    </svg>
                    <span>Filters</span>
                </button>

                <!-- Search -->
                <div class="search-box">
                    <svg
                        class="search-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        v-model="searchValue"
                        type="text"
                        placeholder="Search products…"
                        class="search-input"
                    />
                </div>
            </div>

            <div class="toolbar-right">
                <span class="result-count"
                    >{{ filteredProducts.length }} products</span
                >
                <div class="sort-wrapper">
                    <select v-model="selectedSort" class="sort-select">
                        <option
                            v-for="opt in sortOptions"
                            :key="opt"
                            :value="opt"
                        >
                            {{ opt }}
                        </option>
                    </select>
                    <svg
                        class="select-caret"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </div>
            </div>
        </div>

        <!-- ── Body ───────────────────────────────────────────── -->
        <div class="body-layout">
            <!-- Sidebar Filter (placeholder) -->
            <aside v-if="showFilter" class="filter-sidebar">
                <div class="sidebar-section">
                    <p class="sidebar-label">Category</p>
                    <label class="sidebar-check"
                        ><input type="checkbox" checked /> All</label
                    >
                    <label class="sidebar-check"
                        ><input type="checkbox" /> Electronics</label
                    >
                    <label class="sidebar-check"
                        ><input type="checkbox" /> Fashion</label
                    >
                </div>
                <div class="sidebar-section">
                    <p class="sidebar-label">Price Range</p>
                    <input
                        type="range"
                        min="0"
                        max="200"
                        value="200"
                        class="price-range"
                    />
                    <div class="price-labels">
                        <span>$0</span><span>$200</span>
                    </div>
                </div>
                <div class="sidebar-section">
                    <p class="sidebar-label">Rating</p>
                    <label class="sidebar-check"
                        ><input type="checkbox" /> 4★ &amp; above</label
                    >
                    <label class="sidebar-check"
                        ><input type="checkbox" /> 3★ &amp; above</label
                    >
                </div>
            </aside>

            <!-- Product Grid -->
            <div class="grid-area">
                <transition-group
                    name="fade-list"
                    tag="div"
                    class="product-grid"
                    :class="{ 'grid-wide': !showFilter }"
                >
                    <ProductItem
                        v-for="product in filteredProducts"
                        :key="product.id"
                        :name="product.name"
                        :image="product.image"
                        :desc="product.description"
                        :salePrice="product.salePrice"
                        :offerPrice="product.offerPrice"
                        :rating="product.rating"
                        :goto="product.id"
                    />
                </transition-group>

                <!-- Empty state -->
                <div v-if="filteredProducts.length === 0" class="empty-state">
                    <svg
                        viewBox="0 0 64 64"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                    >
                        <circle cx="32" cy="32" r="28" />
                        <path d="M20 32h24M32 20v24" stroke-linecap="round" />
                    </svg>
                    <p>No products found</p>
                    <span>Try adjusting your search or filters.</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* ── Root ─────────────────────────────────────────────────────── */
.listing-root {
    font-family: "Inter", "Segoe UI", sans-serif;
    color: #1a1a2e;
}

/* ── Toolbar ──────────────────────────────────────────────────── */
.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 16px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.toolbar-left,
.toolbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

/* Filter toggle button */
.icon-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    background: transparent;
    font-size: 0.85rem;
    font-weight: 500;
    color: #444;
    cursor: pointer;
    transition:
        background 0.15s,
        border-color 0.15s;
    white-space: nowrap;
}

.icon-btn:hover {
    background: #f5f5f5;
    border-color: rgba(0, 0, 0, 0.18);
}

.icon-btn svg {
    width: 16px;
    height: 16px;
    color: #666;
}

/* Search */
.search-box {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 10px;
    width: 16px;
    height: 16px;
    color: #aaa;
    pointer-events: none;
}

.search-input {
    padding: 7px 12px 7px 34px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    font-size: 0.85rem;
    color: #333;
    background: #fafafa;
    width: 220px;
    outline: none;
    transition:
        border-color 0.15s,
        background 0.15s;
}

.search-input:focus {
    border-color: #5c6bc0;
    background: #fff;
}

/* Result count */
.result-count {
    font-size: 0.8rem;
    color: #aaa;
    white-space: nowrap;
}

/* Sort */
.sort-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.sort-select {
    appearance: none;
    padding: 7px 34px 7px 12px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    font-size: 0.85rem;
    color: #333;
    background: #fafafa;
    cursor: pointer;
    outline: none;
    transition: border-color 0.15s;
}

.sort-select:focus {
    border-color: #5c6bc0;
}

.select-caret {
    position: absolute;
    right: 10px;
    width: 14px;
    height: 14px;
    color: #aaa;
    pointer-events: none;
}

/* ── Body Layout ──────────────────────────────────────────────── */
.body-layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;
}

/* ── Filter Sidebar ───────────────────────────────────────────── */
.filter-sidebar {
    width: 220px;
    flex-shrink: 0;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.sidebar-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.sidebar-label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #999;
    margin: 0;
}

.sidebar-check {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: #444;
    cursor: pointer;
}

.sidebar-check input[type="checkbox"] {
    accent-color: #5c6bc0;
    width: 14px;
    height: 14px;
    cursor: pointer;
}

.price-range {
    width: 100%;
    accent-color: #5c6bc0;
}

.price-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #aaa;
}

/* ── Grid ─────────────────────────────────────────────────────── */
.grid-area {
    flex: 1;
    min-width: 0;
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.product-grid.grid-wide {
    grid-template-columns: repeat(4, 1fr);
}

/* ── Transition ───────────────────────────────────────────────── */
.fade-list-enter-active,
.fade-list-leave-active {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}
.fade-list-enter-from,
.fade-list-leave-to {
    opacity: 0;
    transform: scale(0.97);
}

/* ── Empty State ──────────────────────────────────────────────── */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #bbb;
    gap: 8px;
}

.empty-state svg {
    width: 52px;
    height: 52px;
    opacity: 0.35;
    margin-bottom: 8px;
}

.empty-state p {
    font-size: 1rem;
    font-weight: 600;
    color: #888;
    margin: 0;
}

.empty-state span {
    font-size: 0.82rem;
    color: #bbb;
}

/* ── Responsive ───────────────────────────────────────────────── */
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
