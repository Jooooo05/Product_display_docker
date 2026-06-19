<script setup lang="ts">
import { computed, ref } from 'vue';
import SvgSprite from '@/components/shared/SvgSprite.vue';
import { useDashboardStore } from '@/stores/dashboard/dashboard-store'; 

const store = useDashboardStore();

const totalProducts   = computed(() => store.totalProductCount);
const totalCategories = computed(() => store.totalCategoryCount);
const totalUsers      = computed(() => store.totalUserCount);
const byStatus        = computed(() => store.productsByStatus);
const byStock         = computed(() => store.productsByStock);
const usersByRole     = computed(() => store.usersByRole);
const alertCount      = computed(() => store.alertProductCount);
const loading         = computed(() => store.loadingStats);

// ── Role chips collapse logic ──
const chipLimit = 2

const allRoles = computed(() => Object.entries(usersByRole.value))
const visibleRoles = computed(() => allRoles.value.slice(0, chipLimit))
const hiddenRoles  = computed(() => allRoles.value.slice(chipLimit))
const hiddenCount  = computed(() => hiddenRoles.value.length)
</script>

<template>
    <v-row class="mb-0">

        <!-- ── Card 1: Total Products ── -->
        <v-col cols="12" md="6" lg="3">
            <v-card variant="outlined" elevation="0" class="bg-surface" rounded="lg">
                <!-- Header -->
                <v-card-text class="d-flex align-center justify-space-between py-3 px-5">
                    <div class="d-flex align-center gap-2">
                        <v-avatar variant="tonal" color="primary" rounded="md" size="36">
                            <SvgSprite name="custom-wallet-outline" style="width: 18px; height: 18px" />
                        </v-avatar>
                        <span class="ml-2 text-subtitle-2 font-weight-medium">Total Products</span>
                    </div>
                </v-card-text>

                <v-divider />

                <!-- Big Number -->
                <v-card-text class="py-6 text-center">
                    <v-skeleton-loader v-if="loading" type="heading" class="mx-auto" width="80" />
                    <h1 v-else class="font-weight-bold text-primary" style="font-size: 3.5rem; line-height: 1">
                        {{ totalProducts }}
                    </h1>
                </v-card-text>

                <v-divider />

                <!-- Chips -->
                <v-card-text class="py-3 px-5 d-flex align-center justify-center flex-wrap">
                    <v-skeleton-loader v-if="loading" type="chip" />
                    <template v-else>
                        <v-chip class="mr-2" size="small" color="success" variant="tonal" rounded="md">
                            {{ byStatus.active }} Active
                        </v-chip>
                        <v-chip class="mr-2" size="small" color="warning" variant="tonal" rounded="md">
                            {{ byStatus.draft }} Draft
                        </v-chip>
                        <v-chip class="mr-2" size="small" color="error" variant="tonal" rounded="md">
                            {{ byStatus.inactive }} Inactive
                        </v-chip>
                    </template>
                </v-card-text>
            </v-card>
        </v-col>

        <!-- ── Card 2: Total Categories ── -->
        <v-col cols="12" md="6" lg="3">
            <v-card variant="outlined" elevation="0" class="bg-surface" rounded="lg">
                <!-- Header -->
                <v-card-text class="d-flex align-center justify-space-between py-3 px-5">
                    <div class="d-flex align-center gap-2">
                        <v-avatar variant="tonal" color="success" rounded="md" size="36">
                            <SvgSprite name="custom-calendar-outline" style="width: 18px; height: 18px" />
                        </v-avatar>
                        <span class="ml-2 text-subtitle-2 font-weight-medium">Total Categories</span>
                    </div>
                </v-card-text>

                <v-divider />

                <!-- Big Number -->
                <v-card-text class="py-6 text-center">
                    <v-skeleton-loader v-if="loading" type="heading" class="mx-auto" width="80" />
                    <h1 v-else class="font-weight-bold text-success" style="font-size: 3.5rem; line-height: 1">
                        {{ totalCategories }}
                    </h1>
                </v-card-text>

                <v-divider />

                <!-- Chips -->
                <v-card-text class="py-3 px-5 d-flex align-center justify-center gap-2 flex-wrap">
                    <v-skeleton-loader v-if="loading" type="chip" />
                    <v-chip v-else size="small" color="success" variant="tonal" rounded="md">
                        Categories available
                    </v-chip>
                </v-card-text>
            </v-card>
        </v-col>

        <!-- ── Card 3: Total Users ── -->
        <v-col cols="12" md="6" lg="3">
            <v-card variant="outlined" elevation="0" class="bg-surface" rounded="lg">
                <v-card-text class="d-flex align-center justify-space-between py-3 px-5">
                    <div class="d-flex align-center gap-2">
                        <v-avatar variant="tonal" color="warning" rounded="md" size="36">
                            <SvgSprite name="custom-user-fill" style="width: 18px; height: 18px" />
                        </v-avatar>
                        <span class="ml-2 text-subtitle-2 font-weight-medium">Total Users</span>
                    </div>
                </v-card-text>

                <v-divider />

                <v-card-text class="py-6 text-center">
                    <v-skeleton-loader v-if="loading" type="heading" class="mx-auto" width="80" />
                    <h1 v-else class="font-weight-bold text-warning" style="font-size: 3.5rem; line-height: 1">
                        {{ totalUsers }}
                    </h1>
                </v-card-text>

                <v-divider />

                <!-- Chips — dynamic per role with tooltip -->
                <v-card-text class="py-3 px-5 d-flex align-center justify-center gap-2 flex-wrap">
                    <v-skeleton-loader v-if="loading" type="chip" />
                    <template v-else>

                        <!-- No roles fallback -->
                        <v-chip v-if="!allRoles.length" size="small" color="warning" variant="tonal" rounded="md">
                            No roles assigned
                        </v-chip>

                        <template v-else>
                            <!-- Visible chips -->
                            <v-chip
                                v-for="([role, count]) in visibleRoles"
                                :key="role"
                                size="small"
                                color="warning"
                                variant="tonal"
                                rounded="md"
                                class="text-capitalize mr-2"
                            >
                                {{ count }} {{ role }}
                            </v-chip>

                            <!-- +N more → tooltip on hover -->
                            <v-tooltip v-if="hiddenCount > 0" location="top">
                                <template #activator="{ props }">
                                    <v-chip
                                        v-bind="props"
                                        size="small"
                                        color="warning"
                                        variant="outlined"
                                        rounded="md"
                                        style="cursor: default"
                                    >
                                        +{{ hiddenCount }} more
                                    </v-chip>
                                </template>

                                <!-- Tooltip content -->
                                <div class="d-flex flex-column gap-1 pa-1">
                                    <span
                                        v-for="([role, count]) in hiddenRoles"
                                        :key="role"
                                        class="text-capitalize text-body-2"
                                    >
                                        {{ count }} {{ role }}
                                    </span>
                                </div>
                            </v-tooltip>
                        </template>

                    </template>
                </v-card-text>
            </v-card>
        </v-col>


        <!-- ── Card 4: Stock Status ── -->
        <v-col cols="12" md="6" lg="3">
            <v-card variant="outlined" elevation="0" class="bg-surface" rounded="lg">
                <!-- Header -->
                <v-card-text class="d-flex align-center justify-space-between py-3 px-5">
                    <div class="d-flex align-center gap-2">
                        <v-avatar variant="tonal" :color="alertCount > 0 ? 'error' : 'success'" rounded="md" size="36">
                            <SvgSprite name="custom-cloud-outline-1" style="width: 18px; height: 18px" />
                        </v-avatar>
                        <span class="ml-2 text-subtitle-2 font-weight-medium">Stock Alert</span>
                    </div>
                    <v-chip
                        v-if="!loading"
                        size="x-small"
                        :color="alertCount > 0 ? 'error' : 'success'"
                        variant="flat"
                        rounded="md"
                    >
                        {{ alertCount > 0 ? 'Need Attention' : 'All Good' }}
                    </v-chip>
                </v-card-text>

                <v-divider />

                <!-- Big Number -->
                <v-card-text class="py-6 text-center">
                    <v-skeleton-loader v-if="loading" type="heading" class="mx-auto" width="80" />
                    <h1
                        v-else
                        class="font-weight-bold"
                        :class="alertCount > 0 ? 'text-error' : 'text-success'"
                        style="font-size: 3.5rem; line-height: 1"
                    >
                        {{ alertCount }}
                    </h1>
                </v-card-text>

                <v-divider />

                <!-- Chips -->
                <v-card-text class="py-3 px-5 d-flex align-center justify-center gap-2 flex-wrap">
                    <v-skeleton-loader v-if="loading" type="chip" />
                    <template v-else>
                        <v-chip class="mr-2" size="small" color="success" variant="tonal" rounded="md">
                            {{ byStock.available }} Available
                        </v-chip>
                        <v-chip class="mr-2" size="small" color="warning" variant="tonal" rounded="md">
                            {{ byStock.low_stock }} Low
                        </v-chip>
                        <v-chip class="mr-2" size="small" color="error" variant="tonal" rounded="md">
                            {{ byStock.out_of_stock }} Out
                        </v-chip>
                    </template>
                </v-card-text>
            </v-card>
        </v-col>

    </v-row>
</template>