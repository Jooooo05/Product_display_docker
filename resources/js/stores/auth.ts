import { defineStore } from 'pinia';
import { router } from '@/router';
import apiClient from '@/utils/axios';
import { useAccessStore } from './user-management/access-store';
import { User } from '@/types/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token'),  // hanya token
    returnUrl: null as string | null,
  }),
  actions: {
    async loginDealer(username: string, password: string) {
      const res: any = await apiClient.post('/dealer/login', { email: username, password });

      // Simpan token saja ke localStorage
      localStorage.setItem('token', res.access_token);
      this.token = res.access_token;

      // Fetch profile dari server
      await this.fetchDealerProfile();

      // ✅ Redirect hanya setelah login
      if (this.returnUrl) {
        router.push(this.returnUrl);
        this.returnUrl = null;
      } else {
        router.push('/');
      }
    },
    async loginAdmin(username: string, password: string) {
      const res: any = await apiClient.post('/admin/login', { email: username, password });

      // Simpan token saja ke localStorage
      localStorage.setItem('token', res.access_token);
      this.token = res.access_token;

      // Fetch profile dari server
      await this.fetchAdminProfile();

      // ✅ Redirect hanya setelah login
      if (this.returnUrl) {
        router.push(this.returnUrl);
        this.returnUrl = null;
      } else {
        router.push('/dashboard');
      }
    },

    async fetchAdminProfile() {
      try {
        const userProfile: User = await apiClient.get('/auth/me');
        console.log('Fetched user profile:', userProfile);

        // ✅ user hanya di Pinia, tidak ke localStorage
        this.user = userProfile;

        const accessStore = useAccessStore();
        const perms: string[] = userProfile.permission_list || [];
        accessStore.setAccess(perms);

        this.initBroadcasting();

      } catch (error) {
        // Token tidak valid / expired → logout bersih
        console.error('Failed to fetch profile:', error);
        await this.logout();
      }
    },

    async fetchDealerProfile() {
      try {
        const userProfile: User = await apiClient.get('/dealer/me');
        console.log('Fetched dealer profile:', userProfile);

        // ✅ user hanya di Pinia, tidak ke localStorage
        this.user = userProfile;

        const accessStore = useAccessStore();
        const perms: string[] = userProfile.permission_list || [];
        accessStore.setAccess(perms);

        this.initBroadcasting();

      } catch (error) {
        // Token tidak valid / expired → logout bersih
        console.error('Failed to fetch profile:', error);
        await this.logout();
      }
    },

    async logout() {
      try {
        if (window.Echo && this.user?.id) {
          window.Echo.leave(`App.Models.User.${this.user.id}`);
        }
        await apiClient.post('/auth/logout');
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
        this.user = null;
        this.token = null;
        localStorage.removeItem('token'); // ✅ hanya hapus token

        const accessStore = useAccessStore();
        accessStore.setAccess([]);

        router.push('/');
      }
    },

    initBroadcasting() {
      if (!this.user || !window.Echo) return;

      window.Echo.private(`App.Models.User.${this.user.id}`)
        .listen('.UserUpdated', () => {
          this.fetchAdminProfile();
        });
    }
  }
});