import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import AuthRoutes from './AuthRoutes';
import { useAuthStore } from '@/stores/auth';
import { useAccessStore } from '@/stores/user-management/access-store';
import { useUIStore } from '@/stores/ui';

export const router = createRouter({
  // Use root base; laravel-vite-plugin sets BASE_URL to /build for assets, not app routes
  history: createWebHistory(),
  routes: [
    MainRoutes,
    AuthRoutes,
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/pages/maintenance/error/Error404Page.vue')
    },
    {
      path: '/',
      component: () => import('@/views/HomePage.vue')
    }
  ]
});

interface User {
  // Define the properties and their types for the user data here
  // For example:
  id: number;
  name: string;
}

// Assuming you have a type/interface for your authentication store
interface AuthStore {
  user: User | null;
  returnUrl: string | null;
  login(username: string, password: string): Promise<void>;
  logout(): void;
}

router.beforeEach(async (to, from, next) => {
    const publicPages = ['/auth/login'];
    const authRequired = !publicPages.includes(to.path);
    const auth = useAuthStore();
    const access = useAccessStore();

    if (to.matched.some((record) => record.meta.requiresAuth)) {

        // Cek 1 — harus sudah login
        if (authRequired && !auth.user) {
            auth.returnUrl = to.fullPath;
            return next('/auth/login');
        }

        // Cek 2 — kalau route butuh Super Admin, cek permission
        if (to.matched.some((record) => record.meta.requiresSuperAdmin)) {
            // Bukan role string lagi, tapi cek permission
            if (!access.hasPermission('user-management.access')) {
                return next('/'); // dealer balik ke halaman produk
            }
        }

        // Cek 3 — cek permissions per route
        if (to.meta.permissions) {
            const requiredPermissions = to.meta.permissions as string[];
            if (!access.hasAnyPermission(requiredPermissions)) {
                return next('/pages/error');
            }
        }
        
        return next();
    }

    next();
});
router.beforeEach(() => {
  const uiStore = useUIStore();
  uiStore.isLoading = true;
});

router.afterEach(() => {
  const uiStore = useUIStore();
  uiStore.isLoading = false;
});
