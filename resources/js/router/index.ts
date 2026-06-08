import { createRouter, createWebHistory } from "vue-router";
import MainRoutes from "./MainRoutes";
import AuthRoutes from "./AuthRoutes";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";
import { useAccessStore } from "@/stores/user-management/access-store";

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        MainRoutes,
        AuthRoutes,
        {
            path: "/",
            component: () => import("@/views/HomePage.vue"),
        },
        {
            path: "/:pathMatch(.*)*",
            component: () =>
                import("@/views/pages/maintenance/error/Error404Page.vue"),
        },
        {
            name: "Product Detail Public",
            path: "/product/detail/public/:id",
            props: true,
            component: () => import("@/views/ProductDetailPage.vue"),
        }
    ],
});

router.beforeEach(async (to, from, next) => {
    const uiStore = useUIStore();
    const auth = useAuthStore();

    uiStore.isLoading = true;

    // Kalau ada token tapi user belum di-fetch → fetch dulu
    if (auth.token && !auth.user) {
        await auth.fetchAdminProfile();
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

    // Route tidak butuh auth → langsung lolos
    if (!requiresAuth) {
        return next();
    }
    

    // Route butuh auth tapi belum login → ke halaman login
    if (!auth.user) {
        auth.returnUrl = to.fullPath;
        return next("/admin/login");
    }

    // Cek requiresSuperAdmin → hanya yang bukan dealer
    const requiresSuperAdmin = to.matched.some((record) => record.meta.requiresSuperAdmin);
    if (requiresSuperAdmin && auth.user.is_dealer) {
      return next('/'); // dealer tidak boleh masuk /main
    }

    // ✅ Cek permission per route
    if (to.meta.permissions) {
        const accessStore = useAccessStore();
        const requiredPermissions = to.meta.permissions as string[];
        if (!accessStore.hasAnyPermission(requiredPermissions)) {
            return next('/pages/error');
        }
    }

    next();
});

router.afterEach(() => {
    const uiStore = useUIStore();
    uiStore.isLoading = false;
});
