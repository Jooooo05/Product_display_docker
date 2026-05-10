import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.request.use(config => {
    const authStore = useAuthStore();
    const { user } = authStore;
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

apiClient.interceptors.response.use(response => {
    return response.data;
}, error => {
    const { response } = error;
    const authStore = useAuthStore();

    if (response) {
        if ([401, 403].includes(response.status)) {
            authStore.logout();
        }
   if (response.status >= 500) {
                // Redirect to the Error 500 page for server errors
                router.push({ name: "Error 500" });
            }
        const errorMessage = (response.data && response.data.message) || response.statusText;
        error.message = errorMessage;
    }

    return Promise.reject(error);
});

export default apiClient;
