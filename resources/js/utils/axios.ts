import axios, { AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth';
import { router } from '@/router';

// ============================================================
// CUSTOM TYPE — karena interceptor unwrap response jadi data langsung
// ============================================================
export interface ApiClient {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

// ============================================================
// INSTANCE
// ============================================================
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 10000, // best practice: selalu set timeout
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================
instance.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();
        const token = authStore.user?.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================
instance.interceptors.response.use(
    (response) => {
        // Unwrap data langsung, jadi di store tinggal pakai `response` bukan `response.data`
        return response.data;
    },
    (error) => {
        const response = error.response;

        if (response) {
            const status = response.status;

            if (status === 401 || status === 403) {
                const authStore = useAuthStore();
                authStore.logout();
                router.push({ name: 'Login' });
            }

            if (status >= 500) {
                router.push({ name: 'Error 500' });
            }

            // Normalize error message
            error.message =
                response.data?.message ||
                response.data?.error ||
                response.statusText ||
                'Something went wrong';
        } else {
            // Network error / timeout / no response
            error.message = 'Network error, please check your connection';
        }

        return Promise.reject(error);
    }
);

// Cast ke custom interface agar type-safe di semua store
const apiClient = instance as unknown as ApiClient;

export default apiClient;