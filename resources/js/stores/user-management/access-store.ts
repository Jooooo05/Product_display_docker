import { defineStore } from 'pinia';

export const useAccessStore = defineStore('access', {
  state: () => ({
    permissions: [] as string[],
  }),
  actions: {
    setAccess(permissions: string[]) {
      this.permissions = permissions;
    },
    hasPermission(permission: string) {
      return this.permissions.includes(permission);
    },
    hasAnyPermission(permissions: string[]) {
      return permissions.some(p => this.permissions.includes(p));
    }
  }
});

    // async login(username: string, password: string) {
    //   const res: any = await apiClient.post('/admin/login', { email: username, password });

    //   const token = res.access_token;
    //   this.user = { token };

    //   const userProfile: any = await apiClient.get('/auth/me');
    //   const user = { ...userProfile, token };

    //   this.user = user;
    //   localStorage.setItem('user', JSON.stringify(user));

    //   const accessStore = useAccessStore();
    //   const perms: string[] = user.permission_list || [];
    //   accessStore.setAccess(perms); // ✅ 1 param

    //   this.initBroadcasting();

    //   if (perms.length > 0) {
    //     router.push(this.returnUrl || '/dashboard');
    //   } else {
    //     router.push('/');
    //   }
    // },
