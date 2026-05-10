<script>
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue'
import UiParentCard from '@/components/shared/UiParentCard.vue'
import CardHeaderFooter from '@/components/shared/CardHeaderFooter.vue'
import DataTableCard from '@/components/shared/DataTableCard.vue'
import WidgetCard2 from '@/components/shared/WidgetCard2.vue'
import { mapStores } from 'pinia';
import { useUserStore } from '@/stores/user-management/user-store';

export default {
  name: 'UserDetail',
  components: {
    BaseBreadcrumb,
    UiParentCard,
    CardHeaderFooter,
    DataTableCard,
    WidgetCard2,
  },
  data() {
    return {
      page: {
        title: 'User Detail'
      },
      breadcrumbs: [
        {
          title: 'User Management',
          disabled: false,
          to: '/user/list'
        },
      ],
      user: null,
      searchValue: '',
      activityLogs: [],
      isUserActive: false,
      headers: [
        { title: '#', key: 'no', align: 'start', sortable: false },
        { title: 'User Name', key: 'user.name', align: 'start' },
        { title: 'Activity Type', key: 'activity_type', align: 'start' },
        { title: 'Time', key: 'created_at', align: 'start' },
      ],
    }
  },
  computed: {
    ...mapStores(useUserStore),
    items() {
        return this.activityLogs;
    }
  },
  methods: {
    async updateUserStatus(isActive) {
        if (!this.user) return;
        const status = isActive ? 'active' : 'inactive';
        const action = isActive ? 'activate' : 'deactivate';

        try {
            const result = await this.$swal.fire({
                customClass: {
                  popup: 'bg-containerBg'
                },
                title: 'Are you sure?',
                text: `Are you sure you want to ${action} this account?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, do it!'
            });

            if (result.isConfirmed) {
                await this.userStore.updateUserStatus(this.user.id, status);
                this.user.status = status;
                this.$swal.fire({
                    customClass: {
                      popup: 'bg-containerBg'
                    },
                    title: 'Updated!',
                    text: `User has been ${status}.`,
                    icon: 'success'
                });
            } else {
                // Revert the switch if cancelled
                this.isUserActive = !isActive;
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            // Revert the switch if API fails
            this.isUserActive = !isActive;
            this.$swal.fire({
                customClass: {
                      popup: 'bg-containerBg'
                },
                title: 'Error!',
                text: 'Failed to update user status.',
                icon: 'error'
            });
        }
    }
  },
  async created() {
    const userId = this.$route.params.id;
    if (userId) {
        try {
            this.user = await this.userStore.fetchUser(userId);
            if (this.user) {
                this.page.title = `${this.user.name}`;
                this.isUserActive = this.user.status === 'active';
            }
            this.activityLogs = await this.userStore.fetchActivityLogs(userId);
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    }
  }
}
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
  <v-row>
    <v-col cols="12" md="4">
        <WidgetCard2 card-color="primary" icon-name="custom-sms" title="Email" :value="user ? user.email : 'Loading...'" />
    </v-col>
    <v-col cols="12" md="4">
        <WidgetCard2 card-color="primary" icon-name="custom-user" title="Role" :value="user ? user.role : 'Loading...'" />
    </v-col>
     <v-col cols="12" md="4">
        <WidgetCard2 card-color="primary" icon-name="custom-lock" title="Permissions" :value="user?.permission_list?.length || user?.permissions?.length || 0" />
    </v-col>

    <v-col cols="12" md="12">
      <DataTableCard>
        <template #search>
          <v-text-field type="text" variant="outlined" persistent-placeholder placeholder="Search logs..."
            v-model="searchValue" density="comfortable" hide-details>
            <template v-slot:prepend-inner>
              <SvgSprite name="custom-search" class="text-lightText" style="width: 14px; height: 14px" />
            </template>
          </v-text-field>
        </template>
        <template #header v-permission="'user-management.edit'">
            <v-switch
                v-if="user"
                v-model="isUserActive"
                hide-details
                inset
                :color="isUserActive ? 'success' : 'error'"
                :label="isUserActive ? 'Active Account' : 'Inactive Account'"
                :disabled="user.id === 1"
                @update:model-value="updateUserStatus"
            />
        </template>
        <v-data-table :headers="headers" :items="items" :search="searchValue" :loading="userStore.loading"
          class="customize-table">
          <template #loading>
            <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
          </template>
          <template v-slot:item.no="{ index }">
            {{ index + 1 }}
          </template>
          <template v-slot:item.created_at="{ item }">
              {{ new Date(item.created_at).toLocaleString() }}
          </template>
        </v-data-table>
      </DataTableCard>
    </v-col>
  </v-row>
</template>
