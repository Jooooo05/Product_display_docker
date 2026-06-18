<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { useTheme } from 'vuetify';
import { useDashboardStore } from '@/stores/dashboard/dashboard-store';

const theme = useTheme();
const store = useDashboardStore();

const currentTheme = ref(theme.current.value.colors);

watch(
    () => theme.current.value.colors.primary,
    (newColor) => {
        currentTheme.value = { ...currentTheme.value, primary: newColor };
    },
);

// ─── Data dari store ──────────────────────────────────────────────────────────
const byStatus  = computed(() => store.productsByStatus);
const byStock   = computed(() => store.productsByStock);
const loading   = computed(() => store.loadingStats);

// ─── Donut chart: Product Status ─────────────────────────────────────────────
const statusChartOptions = computed(() => {
    const primary = currentTheme.value.primary;
    return {
        chart: {
            type: 'donut',
            height: 250,
            fontFamily: 'inherit',
            foreColor: 'rgba(var(--v-theme-darkText), var(--v-high-opacity))',
        },
        labels: ['Active', 'Inactive', 'Draft'],
        colors: [
            primary,
            'rgba(var(--v-theme-warning), var(--v-high-opacity))',
            'rgba(var(--v-theme-secondary), var(--v-high-opacity))',
        ],
        dataLabels: { enabled: false },
        legend: { show: false },
        responsive: [
            { breakpoint: 600, options: { chart: { height: 200 } } },
        ],
    };
});

const statusSeries = computed(() => [
    byStatus.value.active,
    byStatus.value.inactive,
    byStatus.value.draft,
]);

// ─── Donut chart: Stock Status ────────────────────────────────────────────────
const stockChartOptions = computed(() => {
    return {
        chart: {
            type: 'donut',
            height: 250,
            fontFamily: 'inherit',
            foreColor: 'rgba(var(--v-theme-darkText), var(--v-high-opacity))',
        },
        labels: ['Available', 'Low Stock', 'Out of Stock'],
        colors: [
            'rgba(var(--v-theme-success), var(--v-high-opacity))',
            'rgba(var(--v-theme-warning), var(--v-high-opacity))',
            'rgba(var(--v-theme-error), var(--v-high-opacity))',
        ],
        dataLabels: { enabled: false },
        legend: { show: false },
        responsive: [
            { breakpoint: 600, options: { chart: { height: 200 } } },
        ],
    };
});

const stockSeries = computed(() => [
    byStock.value.available,
    byStock.value.low_stock,
    byStock.value.out_of_stock,
]);

// ─── Tab ──────────────────────────────────────────────────────────────────────
const tab = ref('status');

// ─── Legend items ─────────────────────────────────────────────────────────────
const statusLegend = computed(() => [
    { label: 'Active',   color: 'primary', value: byStatus.value.active },
    { label: 'Inactive', color: 'warning', value: byStatus.value.inactive },
    { label: 'Draft',    color: 'secondary', value: byStatus.value.draft },
]);

const stockLegend = computed(() => [
    { label: 'Available',     color: 'success', value: byStock.value.available },
    { label: 'Low Stock',     color: 'warning', value: byStock.value.low_stock },
    { label: 'Out of Stock',  color: 'error',   value: byStock.value.out_of_stock },
]);
</script>

<template>
    <v-card variant="outlined" class="bg-surface" rounded="lg">
        <v-card-text>
            <h5 class="text-h5 mb-0">Product Distribution</h5>
        </v-card-text>

        <!-- Tabs: Status / Stock -->
        <v-tabs v-model="tab" color="primary" class="px-6">
            <v-tab value="status" class="font-weight-medium">By Status</v-tab>
            <v-tab value="stock" class="font-weight-medium">By Stock</v-tab>
        </v-tabs>
        <v-divider />

        <v-card-item class="pa-0">
            <v-window v-model="tab">

                <!-- ── Tab: Product Status ── -->
                <v-window-item value="status">
                    <div class="pa-4">
                        <v-skeleton-loader v-if="loading" type="image" height="250" />
                        <template v-else>
                            <apexchart
                                type="donut"
                                height="250"
                                :options="statusChartOptions"
                                :series="statusSeries"
                            />
                            <!-- Legend -->
                            <v-row class="mt-2 mx-0">
                                <v-col
                                    cols="12"
                                    sm="4"
                                    v-for="item in statusLegend"
                                    :key="item.label"
                                >
                                    <v-sheet rounded="lg" class="pa-3 text-center" color="containerBg">
                                        <p class="text-body-2 mb-1">
                                            <v-avatar size="8" :color="item.color" variant="flat" class="me-1" />
                                            {{ item.label }}
                                        </p>
                                        <h6 class="text-h6 mb-0">{{ item.value }}</h6>
                                    </v-sheet>
                                </v-col>
                            </v-row>
                        </template>
                    </div>
                </v-window-item>

                <!-- ── Tab: Stock Status ── -->
                <v-window-item value="stock">
                    <div class="pa-4">
                        <v-skeleton-loader v-if="loading" type="image" height="250" />
                        <template v-else>
                            <apexchart
                                type="donut"
                                height="250"
                                :options="stockChartOptions"
                                :series="stockSeries"
                            />
                            <!-- Legend -->
                            <v-row class="mt-2 mx-0">
                                <v-col
                                    cols="12"
                                    sm="4"
                                    v-for="item in stockLegend"
                                    :key="item.label"
                                >
                                    <v-sheet rounded="lg" class="pa-3 text-center" color="containerBg">
                                        <p class="text-body-2 mb-1">
                                            <v-avatar size="8" :color="item.color" variant="flat" class="me-1" />
                                            {{ item.label }}
                                        </p>
                                        <h6 class="text-h6 mb-0">{{ item.value }}</h6>
                                    </v-sheet>
                                </v-col>
                            </v-row>
                        </template>
                    </div>
                </v-window-item>

            </v-window>
        </v-card-item>
    </v-card>
</template>