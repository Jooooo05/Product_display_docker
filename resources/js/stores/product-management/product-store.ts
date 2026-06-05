import { defineStore } from 'pinia';
import apiClient from '@/utils/axios';

// ============================================================
// INTERFACES
// ============================================================

interface ProductForm {
    name: string;
    description: string;
    features: string;
    specifications: string;
    sku: string;
    original_price: number | null;
    dealer_price: number | null;
    status: 'Active' | 'Inactive' | 'Draft';
    stock_status: 'available' | 'low_stock' | 'out_of_stock';
    categories: number[];
}

interface ProductItem {
    id: number;
    name: string;
    description: string;
    features: string;
    specifications: string;
    sku: string;
    original_price: number;
    dealer_price: number | null;
    image: string | null;
    image_url: string | null;
    status: 'Active' | 'Inactive' | 'Draft';
    stock_status: 'available' | 'low_stock' | 'out_of_stock';
    categories: { id: number; name: string }[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

interface ProductStoreState {
    listItems: ProductItem[];
    totalItems: number;
    currentPage: number;
    lastPage: number;
    categoryOptions: string[];
    search: string;
    loading: boolean;
    error: string | null;
    success: string | null;
    imageFile: File | null;
    form: ProductForm;
}

// ============================================================
// SEARCH DEBOUNCE
// ============================================================

let searchTimeout: number | undefined;

// ============================================================
// STORE
// ============================================================

export const useProductStore = defineStore({
    id: 'product',

    state: (): ProductStoreState => ({
        listItems: [],
        totalItems: 0,
        currentPage: 1,
        lastPage: 1,
        categoryOptions: [],
        search: '',
        loading: false,
        error: null,
        success: null,
        imageFile: null,
        form: {
            name: '',
            description: '',
            features: '',
            specifications: '',
            sku: '',
            original_price: null,
            dealer_price: null,
            status: 'Active',
            stock_status: 'available',
            categories: [],
            
        },
    }),

    actions: {
        // ─────────────────────────────────────────────
        // FETCH LIST
        // ─────────────────────────────────────────────

        async fetchProducts(
            page = 1, 
            filter?: { 
                categories: number[], 
                priceMin: number | null, 
                priceMax: number | null 
            }) {
            this.loading = true;
            this.error = null;
            console.log('test function berjalan atau tidak');
            try {
                const params = new URLSearchParams();
                params.set('page', String(page));
                params.set('per_page', '12');

                if (this.search) {
                    params.set('search', this.search);
                }

                // Tambahkan filter params
                if (filter?.categories?.length) {
                    filter.categories.forEach(id => params.append('categories[]', String(id)));
                }
                if (filter?.priceMin !== null && filter?.priceMin !== undefined) {
                    params.set('price_min', String(filter.priceMin));
                }
                if (filter?.priceMax !== null && filter?.priceMax !== undefined) {
                    params.set('price_max', String(filter.priceMax));
                }

                console.log('Fetching:', `/products?${params.toString()}`);
                const response: any = await apiClient.get(`/products?${params.toString()}`);
                console.log('Response:', response);

                this.listItems = response.data ?? [];         // array produknya
                this.totalItems = response.total ?? 0;        // total semua produk
                this.currentPage = response.current_page ?? 1;
                this.lastPage = response.last_page ?? 1;

            } catch (err: any) {
                this.error = err?.message || 'Failed to load products';
                this.listItems = [];
            } finally {
                this.loading = false;
            }
        },

        setSearch(value: string) {
            this.search = value;
            if (searchTimeout) clearTimeout(searchTimeout);
            searchTimeout = window.setTimeout(() => {
                this.fetchProducts(1);
            }, 500);
        },

        // ─────────────────────────────────────────────
        // FETCH SINGLE — untuk edit mode
        // ─────────────────────────────────────────────

        async fetchProduct(id: number) {
            this.loading = true;
            this.error = null;
            try {
                const response: any = await apiClient.get(`/products/${id}`);
                const product = response.data ?? response;

                // Populate form
                this.form = {
                    name: product.name,
                    description: product.description,
                    features: product.features || '',
                    specifications: product.specifications || '',
                    sku: product.sku || '',
                    original_price: product.original_price,
                    dealer_price: product.dealer_price ?? null,
                    status: product.status,
                    stock_status: product.stock_status,
                    categories: Array.isArray(product.categories) ? product.categories.map((c: any) => c.id) : [],
                };

                return product;
            } catch (err: any) {
                this.error = err?.message || 'Failed to load product details';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        // ─────────────────────────────────────────────
        // CREATE
        // ─────────────────────────────────────────────

        async createProduct() {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                const payload = this.buildFormData();
                const response: any = await apiClient.post('/products', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                this.success = response.message || 'Product created successfully';
                await this.fetchProducts();
                return response;
            } catch (err: any) {
                this.error = err?.message || 'Failed to create product';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        // ─────────────────────────────────────────────
        // UPDATE
        // ─────────────────────────────────────────────

        async updateProduct(id: number) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                const payload = this.buildFormData();

                // Laravel butuh _method spoofing untuk PUT dengan multipart
                payload.append('_method', 'PUT');

                const response: any = await apiClient.post(`/products/${id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                this.success = response.message || 'Product updated successfully';
                await this.fetchProducts();
                return response;
            } catch (err: any) {
                this.error = err?.message || 'Failed to update product';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        // ─────────────────────────────────────────────
        // DELETE
        // ─────────────────────────────────────────────

        async deleteProduct(id: number) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                const response: any = await apiClient.delete(`/products/${id}`);
                this.success = response.message || 'Product deleted successfully';

                // Hapus dari listItems lokal tanpa refetch
                this.listItems = this.listItems.filter((p) => p.id !== id);

                return response;
            } catch (err: any) {
                this.error = err?.message || 'Failed to delete product';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        // ─────────────────────────────────────────────
        // FETCH CATEGORIES — untuk dropdown options
        // ─────────────────────────────────────────────

        async fetchCategories() {
            try {
                const response: any = await apiClient.get('/categories');
                const categories = response.data ?? response;

                this.categoryOptions = Array.isArray(categories)
                    ? categories.map((c: any) => c.name)
                    : [];
            } catch (err: any) {
                console.error('Failed to fetch categories:', err);
            }
        },

        // ─────────────────────────────────────────────
        // HELPERS
        // ─────────────────────────────────────────────

        /**
         * Build FormData dari form + imageFile.
         * Dipakai oleh create dan update.
         */
        buildFormData(): FormData {
            const fd = new FormData();

            fd.append('name', this.form.name);
            fd.append('description', this.form.description);
            fd.append('features', this.form.features);
            fd.append('specifications', this.form.specifications);
            fd.append('sku', this.form.sku);
            fd.append('original_price', String(this.form.original_price ?? ''));
            fd.append('dealer_price', String(this.form.dealer_price ?? ''));
            fd.append('status', this.form.status);
            fd.append('stock_status', this.form.stock_status);

            // Categories dikirim sebagai array
            this.form.categories.forEach((cat) => {
                fd.append('categories[]', String(cat));
            });

            // Image hanya append kalau ada file baru
            if (this.imageFile) {
                fd.append('image', this.imageFile);
            }

            return fd;
        },

        setImageFile(file: File | null) {
            this.imageFile = file;
        },

        resetForm() {
            this.form = {
                name: '',
                description: '',
                features: '',
                specifications: '',
                sku: '',
                original_price: null,
                dealer_price: null,
                status: 'Active',
                stock_status: 'available',
                categories: [],
            };
            this.imageFile = null;
            this.error = null;
            this.success = null;
        },
    },
});