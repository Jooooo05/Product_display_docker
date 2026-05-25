import { defineStore } from 'pinia';
import axios from '@/utils/axios';
import apiClient from '@/utils/axios';

export const useRoleStore = defineStore('role', {
    state: () => ({
        listItems: [],
        permissionItems: [], // Added state for permissions
        loading: false,
        error: null,
    }),
    actions: {
        async fetchPermissions() {
            try {
                const response: any = await apiClient.get('/permissions');
                if (response.data) {
                    const grouped: any = {};
                    response.data.forEach((p: any) => {
                        const parts = String(p.name).split('.');
                        if (parts.length < 2) return;
                        const action = parts.pop();
                        const module = parts.join('.');
                        if (!action || !module) return;

                        if (!grouped[module]) {
                            grouped[module] = {
                                module,
                                access: false,
                                hasAccess: false,
                                actions: {}
                            };
                        }

                        if (action === 'access') {
                            grouped[module].hasAccess = true;
                            return;
                        }

                        grouped[module].actions[action] = { available: true, value: false };
                    });
                    this.permissionItems = Object.values(grouped);
                }
            } catch (error: any) {
                console.error('Error fetching permissions:', error);
                this.error = error;
            }
        },
        async fetchRoles() {
            this.loading = true;
            this.error = null;
            try {
                const response: any = await apiClient.get('/roles');
                // Backend returns { success: true, message: '...', data: [...] }
                this.listItems = response.data;
            } catch (error: any) {
                this.error = error;
                console.error('Error fetching roles:', error);
            } finally {
                this.loading = false;
            }
        },
        async createRole(payload: any) {
            this.loading = true;
            this.error = null;
            try {
                const response: any = await apiClient.post('/roles', payload);
                await this.fetchRoles(); // Refresh list
                return response;
            } catch (error: any) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async updateRole(id: number, payload: any) {
            this.loading = true;
            this.error = null;
            try {
                const response: any = await apiClient.put(`/roles/${id}`, payload);
                await this.fetchRoles(); // Refresh list
                return response;
            } catch (error: any) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async deleteRole(id: number) {
            this.loading = true;
            this.error = null;
            try {
                const response: any = await apiClient.delete(`/roles/${id}`);
                await this.fetchRoles(); // Refresh list
                return response;
            } catch (error: any) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async saveRole(name: string, permissionItems: any[], id?: number) {
            const permissions: string[] = [];
            permissionItems.forEach((item: any) => {
                if (item.access && item.hasAccess) permissions.push(`${item.module}.access`);
                if (item.actions) {
                    Object.keys(item.actions).forEach((actionKey) => {
                        if (item.actions[actionKey]?.value) {
                            permissions.push(`${item.module}.${actionKey}`);
                        }
                    });
                }
            });

            if (id) {
                return this.updateRole(id, {
                    name: name,
                    permissions: permissions
                });
            } else {
                return this.createRole({
                    name: name,
                    permissions: permissions
                });
            }
        },
        resetPermissions() {
            this.permissionItems.forEach((item: any) => {
                item.access = false;
                if (item.actions) {
                    Object.keys(item.actions).forEach((actionKey) => {
                        item.actions[actionKey].value = false;
                    });
                }
            });
        },
        mapRolePermissions(role: any) {
            this.resetPermissions();
            if (role.permissions && role.permissions.length) {
                const rolePermissions = role.permissions.map((p: any) => p.name);
                const byModule = new Map<string, any>(
                    this.permissionItems.map((i: any) => [i.module, i])
                );

                rolePermissions.forEach((permName: string) => {
                    const parts = String(permName).split('.');
                    if (parts.length < 2) return;
                    const action = parts.pop();
                    const module = parts.join('.');
                    if (!action || !module) return;

                    const item = byModule.get(module);
                    if (!item) return;

                    if (action === 'access') {
                        item.access = true;
                        return;
                    }

                    if (item.actions && item.actions[action]) {
                        item.actions[action].value = true;
                    }
                    item.access = true;
                });
            }
        },

    }
});
