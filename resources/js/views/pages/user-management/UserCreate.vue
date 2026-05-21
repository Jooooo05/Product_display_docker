<script>
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue'
import UiParentCard from '@/components/shared/UiParentCard.vue'
import CardHeaderFooter from '@/components/shared/CardHeaderFooter.vue'
import DataTableCard from '@/components/shared/DataTableCard.vue'
import FormHorizontal from '@/components/shared/FormHorizontal.vue'
import FormVertical from '@/components/shared/FormVertical.vue'
import UiTableCard from '@/components/shared/UiTableCard.vue'
import PermissionTable from '@/components/shared/PermissionTable.vue'
import axios from '@/utils/axios';
import { mapStores } from 'pinia';
import { useUserStore } from '@/stores/user-management/user-store';
import { useAuthStore } from '@/stores/auth';
import { useAccessStore } from '@/stores/user-management/access-store';

export default {
  name: 'UserCreate',
  components: {
    BaseBreadcrumb,
    UiParentCard,
    CardHeaderFooter,
    DataTableCard,
    FormHorizontal,
    FormVertical,
    UiTableCard,
    PermissionTable,
  },
  data() {
    return {
      page: {
        title: 'Create User'
      },
      breadcrumbs: [
        {
          title: 'User Management',
          disabled: false,
          to: '/user/list'
        }
      ],
      roles: [],
      roleList: [],
      permissionItems: [],
      selectAll: false,
      loading: false,
      valid: false,
      scrollbarOptions: {
          suppressScrollX: true,
        },
      rules: {
        required: value => !!value || 'Field is required',
        email: value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return pattern.test(value) || 'Invalid e-mail.'
        },
        min: v => (v && v.length >= 8) || 'Min 8 characters',
      },
      showPassword: false,
    }
  },
  computed: {
    ...mapStores(useUserStore),
    passwordRules() {
      const rules = [];
      if (!this.$route.params.id) {
        rules.push(this.rules.required);
      }
      if (this.password) {
        rules.push(this.rules.min);
      }
      return rules;
    },
    showError: {
      get() {
        return !!this.userStore.error;
      },
      set(val) {
        if (!val) {
          this.userStore.error = null;
        }
      }
    },
    name: {
      get() {
        return this.userStore.form.name;
      },
      set(value) {
        this.userStore.form.name = value;
      }
    },
    email: {
      get() {
        return this.userStore.form.email;
      },
      set(value) {
        this.userStore.form.email = value;
      }
    },
    username: {
      get() {
        return this.userStore.form.username;
      },
      set(value) {
        this.userStore.form.username = value;
      }
    },
    password: {
      get() {
        return this.userStore.form.password;
      },
      set(value) {
        this.userStore.form.password = value;
      }
    },
    role: {
      get() {
        return this.userStore.form.role;
      },
      set(value) {
        this.userStore.form.role = value;
      }
    },
    phone: {
      get() {
        return this.userStore.form.phone;
      },
      set(value) {
        this.userStore.form.phone = value;
      }
    },
    address: {
      get() {
        return this.userStore.form.address;
      },
      set(value) {
        this.userStore.form.address = value;
      }
    },

  },
  created() {
    this.fetchData();
  },
  watch: {
    '$route.params.id': {
      handler(newId) {
        if (newId) {
          this.loadUser(newId);
          this.page.title = 'Edit User';
        } else {
          this.userStore.resetForm();
          this.page.title = 'Create User';
        }
      },
      immediate: true
    },
  },
  methods: {
    setItemAccess(item, val) {
      item.access = val;
      if (item.actions) {
        Object.keys(item.actions).forEach((actionKey) => {
          item.actions[actionKey].value = val;
        });
      }
    },
    applyPermissionListToItems(permissionNames) {
      this.toggleAllAccess(false);

      const byModule = new Map(this.permissionItems.map((i) => [i.module, i]));

      permissionNames.forEach((permName) => {
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

        if (!item.actions) item.actions = {};
        if (!item.actions[action]) item.actions[action] = { available: true, value: false };
        item.actions[action].value = true;
        item.access = true;
      });

      this.checkSelectAll();
    },
    async loadUser(id) {
        try {
            const user = await this.userStore.fetchUser(id);
            // Sync permissions from store to local state
            const userPerms = this.userStore.form.permissions; // array of strings ['user-management.create', ...]

            // We need to wait for permissionItems to be populated first if they aren't already
            if (this.permissionItems.length === 0) {
                 await this.fetchData();
            }

            // If user has specific permissions saved, use them.
            // But if user permissions are empty (unlikely if they have a role), we might need to be careful.
            // Since we save permissions on create/update, userPerms should reflect the last state.

            this.applyPermissionListToItems(userPerms);

        } catch (error) {
            console.error('Error loading user:', error);
        }
    },
    async fetchData() {
      this.loading = true;
      try {
        const roleRes = await axios.get('/roles');
        if (roleRes.data) {
          this.roleList = roleRes.data;
          this.roles = roleRes.data.map(r => ({
            title: r.name,
            value: r.name
          }));
        }

        const permRes = await axios.get('/permissions');
        if (permRes.data) {
          const grouped = {};
          permRes.data.forEach((p) => {
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
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        this.loading = false;
      }
    },
    async submitForm() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;

      try {
        const permissions = [];
        this.permissionItems.forEach((item) => {
          // [RBAC REFACTOR]
          // Only add .access if the main module switch (item.access) is toggled ON.
          // This prevents sending permissions if the user disabled the entire module.
          if (item.access && item.hasAccess) permissions.push(`${item.module}.access`);

          if (item.actions) {
            Object.keys(item.actions).forEach((actionKey) => {
              // [RBAC REFACTOR]
              // Only add action permissions if BOTH the main module switch AND the action switch are ON.
              // This fixes the bug where hidden active actions were sent even when the module was disabled.
              if (item.access && item.actions[actionKey]?.value) {
                permissions.push(`${item.module}.${actionKey}`);
              }
            });
          }
        });

        this.userStore.form.permissions = permissions;

        if (this.$route.params.id) {
            await this.userStore.updateUser(this.$route.params.id);

            // Jika user mengupdate dirinya sendiri, refresh profile auth
            const authStore = useAuthStore();
            if (authStore.user && authStore.user.id == this.$route.params.id) {
              await authStore.fetchProfile();
            }
        } else {
            await this.userStore.createUser();
        }

        // Redirect to list page after successful operation
        this.$router.push('/user/list');
      } catch (error) {
        console.error('Error saving user:', error);
        // Error is handled in store and displayed via snackbar if added
      }
    },
    toggleAllAccess(val) {
      this.permissionItems.forEach((item) => this.setItemAccess(item, val));
      this.selectAll = val;
    },
    checkSelectAll() {
      this.selectAll = this.permissionItems.every(item => item.access);
    },
    onPermissionAccessChange() {
      this.checkSelectAll();
    },
    onRoleChange(roleName) {
      const selectedRole = this.roleList.find(r => r.name === roleName);
      if (!selectedRole) return;

      const rolePerms = selectedRole.permissions.map(p => p.name);
      this.applyPermissionListToItems(rolePerms);
    }
  }
}
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
  <v-row>
    <v-col cols="12" md="12">
    <v-form ref="form" v-model="valid" lazy-validation>
        <v-row>
            <v-col cols="12" md="5">
            <UiParentCard title="Personal Information">
                    <v-row>
                        <v-col cols="12" md="6">
                            <FormVertical label="Name" required>
                                <v-text-field variant="outlined" density="comfortable" v-model="name" placeholder="Enter name" :rules="[rules.required]" />
                            </FormVertical>
                        </v-col>
                        <v-col cols="12" md="6">
                            <FormVertical label="Email" required>
                                <v-text-field variant="outlined" density="comfortable" v-model="email" placeholder="Enter email" :rules="[rules.required, rules.email]" />
                            </FormVertical>
                        </v-col>
                        <v-col cols="12" md="12">
                            <FormHorizontal label="Username" required>
                                <v-text-field variant="outlined" density="comfortable" v-model="username" placeholder="Enter username" :rules="[rules.required]" />
                            </FormHorizontal>
                        </v-col>
                        <v-col cols="12" md="12">
                            <FormHorizontal label="Password" required>
                                <v-text-field :type="showPassword ? 'text' : 'password'" variant="outlined" density="comfortable" v-model="password" placeholder="Enter password" :rules="passwordRules" >
                                    <template #append-inner>
                                        <SvgSprite name="custom-eye" class="cursor-pointer text-lightText" style="width: 20px; height: 20px" v-if="!showPassword" @click="showPassword = !showPassword" />
                                        <SvgSprite name="custom-eye-invisible" class="cursor-pointer text-lightText" style="width: 20px; height: 20px" v-else @click="showPassword = !showPassword" />
                                    </template>
                                </v-text-field>
                            </FormHorizontal>
                        </v-col>
                        <v-col cols="12" md="6">
                            <FormVertical label="Role" required>
                                <v-autocomplete variant="outlined" density="comfortable" v-model="role" :items="roles" single-line label="Enter role" @update:model-value="onRoleChange" :rules="[rules.required]" />
                            </FormVertical>
                        </v-col>
                        <v-col cols="12" md="6">
                            <FormVertical label="Phone" required>
                                    <v-text-field variant="outlined" density="comfortable" v-model="phone" placeholder="Enter phone" type="number" :rules="[rules.required]">
                                        <template #prepend-inner>
                                            <h6 class=" text-h6">+62</h6>
                                        </template>
                                    </v-text-field>
                                </FormVertical>
                            </v-col>
                            <v-divider class="my-5"></v-divider>
                        <v-col cols="12" md="12">
                            <v-textarea rows="5" variant="outlined" density="comfortable" v-model="address" placeholder="Enter address" />
                        </v-col>
                    </v-row>
                <template #footer>
                    <v-btn color="primary" block rounded="md" variant="flat" @click="submitForm" :loading="userStore.loading" :disabled="userStore.loading">Submit</v-btn>
                </template>
        </UiParentCard>
            </v-col>
            <v-col cols="12" md="7">
                <UiParentCard class="mb-5" title="Role Permission">
                    <template #action>
                        <v-switch v-model="selectAll" @update:model-value="toggleAllAccess" color="primary" hide-details inset/>
                    </template>
                     <perfect-scrollbar :options="scrollbarOptions" style="height: calc(100vh - 24px)">
                         <PermissionTable
                             :items="permissionItems"
                             :loading="loading"
                             :select-all="selectAll"
                             :hide-select-all="true"
                             @access-change="onPermissionAccessChange"
                         />
                     </perfect-scrollbar>
                </UiParentCard>
            </v-col>
        </v-row>
     </v-form>
      <v-snackbar v-model="showError" color="error" variant="tonal" :timeout="3000">
        {{ userStore.error }}
        <template v-slot:actions>
          <v-btn variant="text" @click="showError = false">Close</v-btn>
        </template>
      </v-snackbar>
    </v-col>
  </v-row>
</template>
