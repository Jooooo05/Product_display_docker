<script setup lang="ts">
import { onMounted } from 'vue';
import { useDashboardStore } from '@/stores/dashboard/dashboard-store';

import WelcomeBanner from '@/views/components/dashboards/WelcomeBanner.vue';
import ChartCards from '@/components/widgets/ChartCards.vue';
import RecentProducts from '@/components/widgets/RecentProducts.vue';
import ProductDistribution from '@/components/widgets/ProductDistribution.vue';
import MostViewedProducts from '@/components/widgets/MostViewedProducts.vue'; 

const store = useDashboardStore();

onMounted(async () => {
    await store.init();
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
        <!-- Sidebar kanan: Distribution + Most Viewed -->
        <v-col cols="12" xl="8" md="6">
            <MostViewedProducts />
        </v-col>
        <v-col cols="12" xl="4" md="6">
            <ProductDistribution />
        </v-col>

    </v-row>
    
    <v-row>
        <!-- Recent Products — lebih lebar -->
        <v-col cols="12">
            <RecentProducts />
        </v-col>

    </v-row>
</template>