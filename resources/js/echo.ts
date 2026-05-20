import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useAuthStore } from '@/stores/auth';

declare global {
    interface Window {
        Pusher: any;
        Echo: any;
    }
}

window.Pusher = Pusher;

// Hanya inisialisasi Echo kalau key tersedia
if (import.meta.env.VITE_REVERB_APP_KEY) {
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
        authorizer: (channel: any, options: any) => {
            return {
                authorize: (socketId: any, callback: any) => {
                    const authStore = useAuthStore();
                    const token = authStore.user?.token;

                    import('@/utils/axios').then(({ default: axios }) => {
                        axios.post('/broadcasting/auth', {
                            socket_id: socketId,
                            channel_name: channel.name
                        }, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        })
                        .then(response => {
                            callback(false, response);
                        })
                        .catch(error => {
                            callback(true, error);
                        });
                    });
                }
            };
        },
    });
} else {
    // Broadcasting dinonaktifkan — set null supaya tidak error waktu dicek
    window.Echo = null;
}

export default window.Echo;