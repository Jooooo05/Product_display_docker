import { defineStore } from 'pinia';
import apiClient from '@/utils/axios';

// ============================================================
// INTERFACES
// ============================================================

interface CategoryForm {
    name: string;
}

interface CategoryItem {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

interface CategoryStoreState {
    listItems: CategoryItem[];
    search: string;
    loading: boolean;
    error: string | null;
    success: string | null;
    form: CategoryForm;
}

// ============================================================
// SEARCH DEBOUNCE
// ============================================================

let searchTimeout: number | undefined;

// ============================================================
// STORE
// ============================================================

export const useCategoryStore = defineStore({
    id: 'category',

    state: (): CategoryStoreState => ({
        listItems: [],
        search: '',
        loading: false,
        error: null,
        success: null,
        form: {
            name: '',
        },
    }),

    actions: {
        // Fetch categories with optional search

        async fetchCategories() {
            this.loading = true;
            this.error = null;

            try {
                const response = await apiClient.get<CategoryItem[]>('/categories');
                this.listItems = response;
            } catch (error) {
                console.error('Error fetching categories:', error); // tambah ini
                this.error = 'Failed to fetch categories';
            } finally {
                this.loading = false;
            }
        },

        // Create a new category

        async createCategory() {
            this.loading = true;
            this.error = null;
            this.success = null;

            try {
                await apiClient.post<CategoryItem>('/categories', this.form);
                this.success = 'Category created successfully';
                this.fetchCategories();
            } catch (err) {
                this.error = 'Failed to create category';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        // Update an existing category

        async updateCategory(id: number) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                await apiClient.put<CategoryItem>(`/categories/${id}`, this.form);
                await this.fetchCategories();
                this.success = 'Category updated successfully';
            } catch (error) {
                this.error = 'Failed to update category';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Delete a category

        async deleteCategory(id: number) {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                await apiClient.delete(`/categories/${id}`);
                await this.fetchCategories();
                this.success = 'Category deleted successfully';
            } catch (error) {
                this.error = 'Failed to delete category';
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
})