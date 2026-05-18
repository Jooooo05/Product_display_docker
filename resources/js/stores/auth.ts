import { defineStore } from 'pinia';
import { router } from '@/router';
import axios from '@/utils/axios';
import { useAccessStore } from './user-management/access-store';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // initialize state from local storage to enable user to stay logged in
    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    user: JSON.parse(localStorage.getItem('user')),
    returnUrl: null
  }),
  actions: {
    async login(username: string, password: string) {
      const res: any = await axios.post('/auth/login', { email: username, password });

      // update pinia state
      const token = res.access_token;
      this.user = { token }; // Set token immediately so axios interceptor can pick it up

      // Get User Profile
      const userProfile: any = await axios.get('/auth/me');

      const user = { ...userProfile, token };

      this.user = user;
      // store user details and jwt in local storage to keep user logged in between page refreshes
      localStorage.setItem('user', JSON.stringify(user));

      // Update access store
      const accessStore = useAccessStore();
      accessStore.setAccess(user.role, user.permission_list || []);

      // Initialize broadcasting
      this.initBroadcasting();

      // redirect to previous url or default to home page
      router.push(this.returnUrl || '/dashboard');
    },
    async fetchProfile() {
      try {
        const userProfile: any = await axios.get('/auth/me');
        // Keep the token
        const token = this.user?.token;
        const user = { ...userProfile, token };
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));

        // Update access store
        const accessStore = useAccessStore();
        accessStore.setAccess(user.role, user.permission_list || []);

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
        // Leave channels before logout
        if (window.Echo) {
          window.Echo.leave(`App.Models.User.${this.user.id}`);
        }
        await axios.post('/auth/logout');
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
        this.user = null;
        localStorage.removeItem('user');

        // Clear access store
        const accessStore = useAccessStore();
        accessStore.setAccess('', []);

        router.push('/auth/login');
      }
    },
    initBroadcasting() {
        if (!this.user || !window.Echo) return;

        // Listen to private user channel
        window.Echo.private(`App.Models.User.${this.user.id}`)
            .listen('.UserUpdated', (e: any) => {
                console.log('UserUpdated event received:', e);
                // Refresh profile to get new permissions/roles
                this.fetchProfile();
            });
    }
  }
});
