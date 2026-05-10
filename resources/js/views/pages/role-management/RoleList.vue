<script>
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue'
import UiParentCard from '@/components/shared/UiParentCard.vue'
import CardHeaderFooter from '@/components/shared/CardHeaderFooter.vue'
import DataTableCard from '@/components/shared/DataTableCard.vue'
import FormHorizontal from '@/components/shared/FormHorizontal.vue'
import PermissionTable from '@/components/shared/PermissionTable.vue'
import { mapStores } from 'pinia';
import { useRoleStore } from '@/stores/role-management/role-store';

export default {
  name: 'RolePage',
  components: {
    BaseBreadcrumb,
    UiParentCard,
    CardHeaderFooter,
    DataTableCard,
    FormHorizontal,
    PermissionTable
  },
  data() {
    return {
      dialogRole: false,
      roleName: '',
      editedRoleId: null,
      page: {
        title: 'Role & Permission'
      },
      breadcrumbs: [
        {
          title: 'Settings',
          disabled: true,
          to: '#'
        }
    ],
      headers: [
        {
          title: 'No',
          key: 'no',
          width: '50px',
          sortable: false
        },
        {
          title: 'Role Name',
          key: 'name',
          align: 'start'
        },
        {
          title: 'Users',
          key: 'users_count',
          align: 'center',
          sortable: true
        },
        {
          title: 'Permissions',
          key: 'permissions',
          sortable: false
        },
        {
          title: 'Status',
          key: 'status',
          align: 'center',
          sortable: false
        },
        {
          title: 'Action',
          key: 'action',
          align: 'center',
          sortable: false
        }
      ],
      items: [],
      // permissionItems: [], // Moved to store
      selectAll: false,
    //   isActive: true,
      searchValue: '',
      loading: false,
      isSubmitting: false,
      snackbar: {
        show: false,
        message: '',
        color: 'success',
      },
    }
  },
  computed: {
    ...mapStores(useRoleStore),
    roleItems() {
        return this.roleStore.listItems;
    },
    permissionItems() {
        return this.roleStore.permissionItems;
    },
    isLoading() {
        return this.roleStore.loading;
    }
  },
  created() {
    this.roleStore.fetchRoles();
    this.roleStore.fetchPermissions();
  },
  methods: {
    // fetchData removed
    setItemAccess(item, val) {
      item.access = val;
      if (item.actions) {
        Object.keys(item.actions).forEach((actionKey) => {
          item.actions[actionKey].value = val;
        });
      }
    },
    toggleAllAccess(val) {
      this.permissionItems.forEach((item) => this.setItemAccess(item, val));
    },
    checkSelectAll() {
      this.selectAll = this.permissionItems.every(item => item.access);
    },
    onPermissionAccessChange() {
      this.checkSelectAll();
    },
    async submitRole() {
        if (!this.roleName) {
            this.snackbar = { show: true, message: 'Role Name is required', color: 'error' };
            return;
        }

        this.isSubmitting = true;

        try {
            await this.roleStore.saveRole(this.roleName, this.permissionItems, this.editedRoleId);
            const action = this.editedRoleId ? 'updated' : 'created';
            this.snackbar = { show: true, message: `Role ${action} successfully`, color: 'success' };
            this.dialogRole = false;
            // Reset form
            this.resetForm();
        } catch (error) {
            this.snackbar = { show: true, message: error.message || 'Failed to save role', color: 'error' };
        } finally {
            this.isSubmitting = false;
        }
    },
    resetForm() {
        this.roleName = '';
        this.editedRoleId = null;
        this.roleStore.resetPermissions();
        this.selectAll = false;
    },
    openCreateDialog() {
        this.resetForm();
        this.dialogRole = true;
    },
    openEditDialog(item) {
        this.editedRoleId = item.id;
        this.roleName = item.name;

        // Map existing permissions
        this.roleStore.mapRolePermissions(item);
        this.checkSelectAll();

        this.dialogRole = true;
    },
    openDeleteDialog(item) {
        if (item.users_count > 0) {
            this.$swal.fire({
                customClass: {
                    popup: 'bg-containerBg'
                },
                icon: 'error',
                title: 'Cannot Delete',
                text: `This role is assigned to ${item.users_count} users. Please reassign or remove them first.`,
            });
            return;
        }

        this.$swal.fire({
            customClass: {
            popup: 'bg-containerBg'
          },
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await this.roleStore.deleteRole(item.id);
                    this.$swal.fire({
                        customClass: {
                            popup: 'bg-containerBg'
                        },
                        title: 'Deleted!',
                        text: 'Role has been deleted.',
                        icon: 'success'
                    });
                } catch (error) {
                    this.$swal.fire({
                        customClass: {
                            popup: 'bg-containerBg'
                        },
                        title: 'Error!',
                        text: error.message || 'Failed to delete role',
                        icon: 'error'
                    });
                }
            }
        });
    }
  }
}
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
  <v-snackbar
  variant="flat"
  rounded="md"
  class="text-surface"
    v-model="snackbar.show"
    :color="snackbar.color"
    location="top right"
    :timeout="3000"
  >
   <SvgSprite name="custom-info-circle-outline" v-if="snackbar.color === 'error'" class="me-1" style="width: 16px; height: 16px" />
    <SvgSprite name="custom-checkbox-marked-circle-outline" v-else class="me-1" style="width: 16px; height: 16px" />
    {{ snackbar.message }}
  </v-snackbar>
  <v-row>
    <v-col cols="12" md="12">
      <DataTableCard>
        <template #search>
             <v-text-field
                type="text"
                variant="outlined"
                persistent-placeholder
                placeholder="Search 200 records..."
                v-model="searchValue"
                density="comfortable"
                hide-details
              >
                <template v-slot:prepend-inner>
                  <SvgSprite name="custom-search" class="text-lightText" style="width: 14px; height: 14px" />
                </template>
              </v-text-field>
        </template>
        <template #header>
            <v-btn v-permission="'role-management.create'" @click="openCreateDialog" color="primary" variant="text" aria-label="print" rounded="md">
                  <SvgSprite name="custom-plus" class="me-1" style="width: 14px; height: 14px" />Create
                </v-btn>
        </template>
        <!-- Create Edit Role -->
        <v-dialog scrollable persistent v-model="dialogRole" max-width="900px">
            <CardHeaderFooter :title="editedRoleId ? 'Edit Role' : 'Add Role'">
                <FormHorizontal label="Role Name" class="mb-md-4" required>
                    <v-text-field
                        type="text"
                        variant="outlined"
                        persistent-placeholder
                        placeholder="Role Name"
                        v-model="roleName"
                        density="comfortable"
                        hide-details
                    >
                        <template v-slot:prepend-inner>
                            <SvgSprite name="custom-tag-fill" class="text-lightText" style="width: 18px; height: 18px" />
                        </template>
                    </v-text-field>
                </FormHorizontal>
                <div class="d-flex justify-space-between align-center mb-5">
                    <h5 class="text-h5">Permissions</h5>
                    <v-switch v-model="selectAll" @update:model-value="toggleAllAccess" color="primary" hide-details inset label="Select All" class="ms-auto" />
                </div>
                <PermissionTable
                    :items="permissionItems"
                    :select-all="selectAll"
                    :hide-select-all="true"
                    @access-change="onPermissionAccessChange"
                />
                <template #footer>
                    <v-btn color="error" variant="text" rounded="md" @click="dialogRole = false">Cancel</v-btn>
                    <v-btn color="primary" variant="flat" rounded="md" @click="submitRole" :loading="isSubmitting">{{ editedRoleId ? 'Update' : 'Add' }}</v-btn>
                </template>
            </CardHeaderFooter>
        </v-dialog>
        <v-data-table
          :headers="headers"
          :items="roleItems"
          :search="searchValue"
          :loading="isLoading"
          class="customize-table"
        >
       <template #loading>
           <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>
          <template v-slot:item.no="{ index }">
            {{ index + 1 }}
          </template>
          <template v-slot:item.users_count="{ item }">
            <v-chip color="primary" variant="flat" size="small">
                {{ item.users_count }} Users
            </v-chip>
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip color="success" variant="flat" size="small" v-if="item.users_count > 0">Active</v-chip>
            <v-chip color="error" variant="flat" size="small" v-else>Inactive</v-chip>
          </template>
          <template v-slot:item.permissions="{ item }">
             <div class="text-truncate" style="max-width: 300px;">
                <span v-if="item.permissions && item.permissions.length">
                    {{ item.permissions.length }} permissions
                </span>
                <span v-else class="text-disabled">-</span>
             </div>
          </template>
          <template v-slot:item.action="{ item }">
            <v-btn
              icon
              variant="text"
              color="primary"
              size="small"
              rounded="md"
              v-permission="'role-management.edit'"
              @click="openEditDialog(item)"
              :disabled="item.name === 'Super Admin'"
            >
              <SvgSprite name="custom-edit-outline" style="width: 18px; height: 18px" />
            </v-btn>
             <v-btn
              icon
              variant="text"
              color="error"
              size="small"
              rounded="md"
              v-permission="'role-management.delete'"
              @click="openDeleteDialog(item)"
              :disabled="item.name === 'Super Admin'"
            >
              <SvgSprite name="custom-trash" style="width: 18px; height: 18px" />
            </v-btn>
          </template>
        </v-data-table>
      </DataTableCard>
    </v-col>
  </v-row>
</template>
