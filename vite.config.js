import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            // Use only existing entry points to avoid build errors
            input: ['resources/js/main.ts', 'resources/js/assets/fonts/inter.css'],
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        vuetify({
            autoImport: true,
        }),
        VitePWA({
            registerType: 'prompt',
            includeAssets: ['favicon.svg', 'robots.txt'],
            manifest: {
                name: 'Able Pro - Laravel Starter',
                short_name: 'Able Pro',
                description: 'Laravel + Vue + Vuetify Starter Kit',
                theme_color: '#F8F9FA',
                background_color: '#F8F9FA',
                display: 'standalone',
                start_url: '/',
                scope: '/',
                lang: 'en',
                icons: [
                    {
                        src: '/icons/manifest-icon-192.maskable.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/icons/manifest-icon-512.maskable.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
                maximumFileSizeToCacheInBytes: 6 * 1024 * 1024 // allow up to ~6MB bundles
            }
        }),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
});
