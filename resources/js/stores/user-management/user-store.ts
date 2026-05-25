import { defineStore } from 'pinia';
import axios from '@/utils/axios';
import apiClient from '@/utils/axios';
import { useAuthStore } from '@/stores/auth';

let searchTimeout: number | undefined;

interface UserForm {
  name: string;
  email: string;
  username: string;
  password?: string;
  role: string | null;
  phone: string;
  address: string;
  permissions: string[];
}

interface UserItem {
  id: number;
  name: string;
  nickname?: string;
  email: string;
  status: string;
  created_at: string;
  updated_at: string;
  roleName?: string | null;
  [key: string]: unknown;
}

interface UserStoreState {
  listItems: UserItem[];
  search: string;
  loading: boolean;
  error: string | null;
  success: string | null;
  form: UserForm;
}

export const useUserStore = defineStore({
  id: 'user',
  state: (): UserStoreState => ({
    listItems: [],
    search: '',
    loading: false,
    error: null,
    success: null,
    form: {
      name: '',
      email: '',
      username: '',
      password: '',
      role: null,
      phone: '',
      address: '',
      permissions: []
    }
  }),
  actions: {
    async fetchActivityLogs(userId: number) {
      this.loading = true;
      try {
        const response: any = await apiClient.get(`/login-activity-logs?user_id=${userId}`);
        return response.data || [];
      } catch (err: any) {
        console.error('Failed to fetch activity logs:', err);
        return [];
      } finally {
        this.loading = false;
      }
    },
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      try {
        const authStore = useAuthStore();
        // const branchId = authStore.user?.branch_id;

        // if (!branchId) {
        //   this.listItems = [];
        //   return;
        // }

        const params = new URLSearchParams();
        if (this.search) {
          params.set('search', this.search);
        }

        const url = `/users?${params.toString()}`;
        const response: any = await apiClient.get(url);
        const users = response.data ?? response;

        this.listItems = Array.isArray(users)
          ? users.map((user: any) => {
              const roles = Array.isArray(user.roles) ? user.roles : [];
              const primaryRole = user.role || (roles.length > 0 ? roles[0].name : null);

              return {
                ...user,
                roleName: primaryRole,
              } as UserItem;
            })
          : [];
      } catch (err: any) {
        if (typeof err === 'string') {
          this.error = err;
        } else if (err && typeof err.message === 'string') {
          this.error = err.message;
        } else {
          this.error = 'Failed to load users';
        }
        this.listItems = [];
      } finally {
        this.loading = false;
      }
    },
    setSearch(value: string) {
      this.search = value;
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      searchTimeout = window.setTimeout(() => {
        this.fetchUsers();
      }, 500);
    },
    async createUser() {
      this.loading = true;
      this.error = null;
      this.success = null;
      try {
        const url = `/users`;
        const payload: UserForm = { ...this.form };
        const response: any = await apiClient.post(url, payload);
        this.success = response.message || 'User created successfully';
        // this.resetForm(); // Removed to prevent UI clearing before navigation
        await this.fetchUsers();
        return response;
      } catch (err: any) {
        if (typeof err === 'string') {
          this.error = err;
        } else if (err && typeof err.message === 'string') {
          this.error = err.message;
        } else {
          this.error = 'Failed to create user';
        }
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async fetchUser(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const url = `/users/${id}`;
        const response: any = await apiClient.get(url);
        const user = response.data ?? response;

        // Populate form
        this.form = {
            name: user.name,
            email: user.email,
            username: user.nickname || user.username || '',
            password: '',
            role: user.role || (user.roles && user.roles.length > 0 ? user.roles[0].name : null),
            phone: user.phone || '',
            address: user.address || '',
            permissions: user.permission_list || (user.permissions ? user.permissions.map((p: any) => p.name) : [])
        };

        return user;
      } catch (err: any) {
        if (typeof err === 'string') {
          this.error = err;
        } else if (err && typeof err.message === 'string') {
          this.error = err.message;
        } else {
          this.error = 'Failed to load user details';
        }
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updateUser(id: number) {
        this.loading = true;
        this.error = null;
        this.success = null;
        try {
            const url = `/users/${id}`;
            const payload: any = { ...this.form };
            // Remove empty password if not provided
            if (!payload.password) {
                delete payload.password;
            }

            const response: any = await apiClient.put(url, payload);
            this.success = response.message || 'User updated successfully';
            await this.fetchUsers();
            return response;
        } catch (err: any) {
            if (typeof err === 'string') {
                this.error = err;
            } else if (err && typeof err.message === 'string') {
                this.error = err.message;
            } else {
                this.error = 'Failed to update user';
            }
            throw err;
        } finally {
            this.loading = false;
        }
    },
    async updateUserStatus(id: number, status: string) {
        this.loading = true;
        this.error = null;
        this.success = null;
        try {
            const url = `/users/${id}`;
            // Only send status
            const payload = { status };

            const response: any = await axios.put(url, payload);
            this.success = response.message || 'User status updated successfully';

            // Update the user in listItems if exists
            const index = this.listItems.findIndex(u => u.id === id);
            if (index !== -1) {
                this.listItems[index].status = status;
            }

            return response;
        } catch (err: any) {
             if (typeof err === 'string') {
                this.error = err;
            } else if (err && typeof err.message === 'string') {
                this.error = err.message;
            } else {
                this.error = 'Failed to update user status';
            }
            throw err;
        } finally {
            this.loading = false;
        }
    },

    resetForm() {
      this.form = {
        name: '',
        email: '',
        username: '',
        password: '',
        role: null,
        phone: '',
        address: '',
        permissions: []
      };
    }
  }
});
