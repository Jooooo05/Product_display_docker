<script setup lang="ts">
import { onMounted } from 'vue';
import { useDashboardStore } from '@/stores/dashboard/dashboard-store'; 

import WelcomeBanner from '@/views/components/dashboards/WelcomeBanner.vue';
import ChartCards from '@/components/widgets/ChartCards.vue';
import RecentProducts from '@/components/widgets/RecentProducts.vue';
import ProductDistribution from '@/components/widgets/ProductDistribution.vue';

const store = useDashboardStore();

onMounted(() => {
    store.init();
});
</script>

<template>
    <!-- Welcome Banner -->
    <v-row class="my-0">
        <v-col cols="12">
            <WelcomeBanner />
        </v-col>
    </v-row>

    <!-- Stat Cards -->
    <ChartCards />

    <!-- Main Content -->
    <v-row>
        <!-- Recent Products — lebih lebar -->
        <v-col cols="12" xl="8" md="7">
            <RecentProducts />
        </v-col>

        <!-- Product Distribution — sidebar kanan -->
        <v-col cols="12" xl="4" md="5">
            <ProductDistribution />
        </v-col>
    </v-row>
</template>