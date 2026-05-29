<script>
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue'
import CardHeaderFooter from '@/components/shared/CardHeaderFooter.vue'
import DataTableCard from '@/components/shared/DataTableCard.vue'
import { mapStores } from 'pinia';
import { useUserStore } from '@/stores/user-management/user-store';
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'

export default {
  name: 'UserList',
  components: {
    BaseBreadcrumb,
    CardHeaderFooter,
    DataTableCard,
    SkeletonLoader,
  },
  data() {
    return {
      page: {
        title: 'User Management'
      },
      breadcrumbs: [
        {
          title: 'Settings',
          disabled: true,
          to: '#'
        }
      ],
      headers: [
        { title: '#', key: 'no', align: 'start', sortable: false },
        { title: 'Name', key: 'name', align: 'start' },
        { title: 'Email', key: 'email', align: 'start' },
        { title: 'Role', key: 'role', align: 'start' },
        { title: 'Status', key: 'status', align: 'start' },
        { title: 'Action', key: 'action', align: 'center', sortable: false },
      ]
    }
  },
  computed: {
    ...mapStores(useUserStore),
    searchValue: {
      get() {
        return this.userStore.search;
      },
      set(value) {
        this.userStore.setSearch(value);
      }
    },
    items() {
      return this.userStore.listItems.map((user, index) => ({
        id: user.id, // Add ID for routing
        no: index + 1,
        name: user.name,
        email: user.email,
        role: user.roleName ?? '-',
        status: user.status
      }));
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
    showSuccess: {
      get() {
        return !!this.userStore.success;
      },
      set(val) {
        if (!val) {
          this.userStore.success = null;
        }
      }
    }
  },
  created() {
    this.userStore.fetchUsers();
  }
}
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
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
          hide-details>
            <template v-slot:prepend-inner>
              <SvgSprite name="custom-search" class="text-lightText" style="width: 14px; height: 14px" />
            </template>
          </v-text-field>
        </template>
        <template #header>
          <v-btn icon variant="text" aria-label="copy" rounded="md" to="/user/create"
            v-permission="'user-management.create'">
            <SvgSprite name="custom-plus" style="width: 16px; height: 16px" />
          </v-btn>
          <v-btn icon variant="text" aria-label="print" rounded="md">
            <SvgSprite name="custom-printer-outline" style="width: 16px; height: 16px" />
          </v-btn>
          <v-btn icon variant="text" aria-label="filter" rounded="md">
            <SvgSprite name="custom-filter" style="width: 16px; height: 16px" />
          </v-btn>
        </template>
        <v-data-table :headers="headers" :items="items" :search="searchValue" :loading="userStore.loading"
          class="customize-table">
          <template #loading>
            <!-- <v-skeleton-loader type="table-row@10"></v-skeleton-loader> -->
            <SkeletonLoader type="List" />
          </template>
          <template v-slot:item.no="{ index }">
            {{ index + 1 }}
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip :color="item.status === 'active' ? 'success' : 'error'" variant="tonal" size="small" rounded="md"
              label class="text-capitalize">
              {{ item.status }}
            </v-chip>
          </template>

          <template v-slot:item.action="{ item }">
            <v-btn icon variant="text" color="secondary" size="small" rounded="md" :to="`/user/edit/${item.id}`"
              v-permission="'user-management.edit'">
              <SvgSprite name="custom-edit-outline" style="width: 18px; height: 18px" />
            </v-btn>
             <v-btn icon variant="text" color="secondary" size="small" rounded="md" :to="`/user/detail/${item.id}`"
              v-permission="'user-management.read'">
              <SvgSprite name="custom-eye" style="width: 18px; height: 18px" />
            </v-btn>
          </template>
        </v-data-table>
      </DataTableCard>
      <v-snackbar v-model="showError" color="error" variant="tonal" :timeout="3000">
        {{ userStore.error }}
        <template v-slot:actions>
          <v-btn variant="text" @click="showError = false">Close</v-btn>
        </template>
      </v-snackbar>
      <v-snackbar v-model="showSuccess" location="top right" color="success" variant="tonal" class="text-surface" :timeout="3000">
        <SvgSprite name="custom-checkbox-marked-circle-outline" class="me-1" style="width: 16px; height: 16px" />
        {{ userStore.success }}
        <template v-slot:actions>
          <v-btn variant="text" @click="showSuccess = false"><SvgSprite name="custom-close" style="width: 16px; height: 16px; transform: rotate(45deg)" /></v-btn>
        </template>
      </v-snackbar>
    </v-col>
  </v-row>
</template>
