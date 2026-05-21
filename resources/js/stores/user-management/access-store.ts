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