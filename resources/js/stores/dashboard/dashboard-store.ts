import { defineStore } from 'pinia';
import apiClient from '@/utils/axios';

// ============================================================
// INTERFACES
// ============================================================

interface ProductStatus {
    active: number;
    inactive: number;
    draft: number;
}

interface StockStatus {
    available: number;
    low_stock: number;
    out_of_stock: number;
}

interface DashboardStats {
    products: {
        total: number;
        by_status: ProductStatus;
        by_stock: StockStatus;
    };
    categories: {
        total: number;
    };
    users: {
        total: number;
        by_role: Record<string, number>;
    };
}

interface DashboardProduct {
    id: number;
    name: string;
    sku: string | null;
    image_url: string | null;
    original_price: number;
    dealer_price: number | null;
    discount_percent: number | null;
    status: 'Active' | 'Inactive' | 'Draft';
    stock_status: 'available' | 'low_stock' | 'out_of_stock';
    categories: { id: number; name: string }[];
    created_by: string | null;
    created_at: string;
}

interface ProductFilters {
    status: string;
    stock_status: string;
    category_id: number | null;
}

interface DashboardStoreState {
    stats: DashboardStats | null;
    products: DashboardProduct[];
    totalProducts: number;
    currentPage: number;
    lastPage: number;
    filters: ProductFilters;
    loadingStats: boolean;
    loadingProducts: boolean;
    error: string | null;
}

// ============================================================
// STORE
// ============================================================

export const useDashboardStore = defineStore({
    id: 'dashboard',

    state: (): DashboardStoreState => ({
        stats: null,
        products: [],
        totalProducts: 0,
        currentPage: 1,
        lastPage: 1,
        filters: {
            status: '',
            stock_status: '',
            category_id: null,
        },
        loadingStats: false,
        loadingProducts: false,
        error: null,
    }),

    getters: {
        totalProductCount:  (state) => state.stats?.products.total ?? 0,
        totalCategoryCount: (state) => state.stats?.categories.total ?? 0,
        totalUserCount:     (state) => state.stats?.users.total ?? 0,

        productsByStatus: (state) => state.stats?.products.by_status ?? { active: 0, inactive: 0, draft: 0 },
        productsByStock:  (state) => state.stats?.products.by_stock  ?? { available: 0, low_stock: 0, out_of_stock: 0 },
        usersByRole:      (state) => state.stats?.users.by_role ?? {},

        alertProductCount: (state) => {
            const stock = state.stats?.products.by_stock;
            if (!stock) return 0;
            return stock.low_stock + stock.out_of_stock;
        },

        hasActiveFilters: (state) => {
            return !!(state.filters.status || state.filters.stock_status || state.filters.category_id);
        },
    },

    actions: {
        // ─────────────────────────────────────────────
        // FETCH STATS
        // ─────────────────────────────────────────────

        async fetchStats() {
            this.loadingStats = true;
            this.error = null;
            try {
                // apiClient interceptor return response.data langsung
                // → response = { products: {...}, categories: {...}, users: {...} }
                const response: any = await apiClient.get('/dashboard');
                this.stats = response;
            } catch (err: any) {
                this.error = err?.message || 'Failed to load dashboard stats';
            } finally {
                this.loadingStats = false;
            }
        },

        // ─────────────────────────────────────────────
        // FETCH PRODUCTS
        // ─────────────────────────────────────────────

        async fetchProducts(page = 1) {
            this.loadingProducts = true;
            this.error = null;
            try {
                const params = new URLSearchParams();
                params.set('page', String(page));
                params.set('per_page', '5');

                if (this.filters.status)      params.set('status', this.filters.status);
                if (this.filters.stock_status) params.set('stock_status', this.filters.stock_status);
                if (this.filters.category_id)  params.set('category_id', String(this.filters.category_id));

                // apiClient interceptor return response.data langsung
                // → response = Laravel paginator: { data: [...], total, current_page, last_page }
                const response: any = await apiClient.get(`/dashboard/products?${params.toString()}`);

                this.products      = response.data         ?? [];
                this.totalProducts = response.total        ?? 0;
                this.currentPage   = response.current_page ?? 1;
                this.lastPage      = response.last_page    ?? 1;
            } catch (err: any) {
                this.error    = err?.message || 'Failed to load products';
                this.products = [];
            } finally {
                this.loadingProducts = false;
            }
        },

        // ─────────────────────────────────────────────
        // FILTER ACTIONS
        // ─────────────────────────────────────────────

        setFilter(key: keyof ProductFilters, value: string | number | null) {
            (this.filters as any)[key] = value;
            this.fetchProducts(1);
        },

        resetFilters() {
            this.filters = { status: '', stock_status: '', category_id: null };
            this.fetchProducts(1);
        },

        // ─────────────────────────────────────────────
        // INIT
        // ─────────────────────────────────────────────

        async init() {
            await Promise.all([
                this.fetchStats(),
                this.fetchProducts(),
            ]);
        },
    },
});