import { defineStore } from 'pinia';
import { router } from '@/router';
import axios from '@/utils/axios';
import { useAccessStore } from './user-management/access-store';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    returnUrl: null as string | null,
  }),
  actions: {
    async login(username: string, password: string) {
      const res: any = await axios.post('/auth/login', { email: username, password });

      const token = res.access_token;
      this.user = { token };

      const userProfile: any = await axios.get('/auth/me');
      const user = { ...userProfile, token };

      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));

      const accessStore = useAccessStore();
      const perms: string[] = user.permission_list || [];
      accessStore.setAccess(perms); // ✅ 1 param

      this.initBroadcasting();

      if (perms.length > 0) {
        router.push(this.returnUrl || '/dashboard');
      } else {
        router.push('/');
      }
    },

    async fetchProfile() {
      try {
        const userProfile: any = await axios.get('/auth/me');
        const token = this.user?.token;
        const user = { ...userProfile, token };

        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));

        const accessStore = useAccessStore();
        const perms: string[] = user.permission_list || [];
        accessStore.setAccess(perms); // ✅ 1 param

        // Re-check current route permission
        const currentRoute = router.currentRoute.value;
        if (currentRoute.meta.permissions) {
          const requiredPermissions = currentRoute.meta.permissions as string[];
          if (!accessStore.hasAnyPermission(requiredPermissions)) {
            router.push('/pages/error');
          }
        }
      } catch (error) {
        console.error('Failed to refresh profile', error);
      }
    },

    async logout() {
      try {
        if (window.Echo) {
          window.Echo.leave(`App.Models.User.${this.user.id}`);
        }
        await axios.post('/auth/logout');
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
        this.user = null;
        localStorage.removeItem('user');

        const accessStore = useAccessStore();
        accessStore.setAccess([]); // ✅ 1 param, array kosong

        router.push('/auth/login');
      }
    },

    initBroadcasting() {
      if (!this.user || !window.Echo) return;

      window.Echo.private(`App.Models.User.${this.user.id}`)
        .listen('.UserUpdated', () => {
          this.fetchProfile();
        });
    }
  }
});