<script setup lang="ts">
// imported components
import WelcomeBanner from '@/views/components/dashboards/WelcomeBanner.vue'; 
import ChartCards from '@/components/widgets/ChartCards.vue'; 
import RepeatCustomer from '@/components/widgets/RepeatCustomer.vue';
import ProjectOverview from '@/components/widgets/ProjectOverview.vue';
import UserCard from '@/components/widgets/UserCard.vue'; 
import ProjectCard from '@/views/components/dashboards/ProjectCard.vue';
import TransactionCard from '@/components/widgets/TransactionCard.vue';
import TotalIncome from '@/components/widgets/TotalIncome.vue'; 
</script>

<template>
  <!-- -------------------------------------------------------------------- -->
  <!-- welcome banner -->
  <!-- -------------------------------------------------------------------- -->
  <v-row class="my-0">
    <v-col cols="12">
      <WelcomeBanner />
    </v-col>
  </v-row>

  <!-- -------------------------------------------------------------------- -->
  <!-- Chart widgets -->
  <!-- -------------------------------------------------------------------- -->
  <ChartCards />

  <v-row class="mb-0">
    <v-col cols="12" xl="9" md="8">
      <v-row>
        <!-- -------------------------------------------------------------------- -->
        <!-- Repeat customer -->
        <!-- -------------------------------------------------------------------- -->
        <v-col cols="12">
          <RepeatCustomer />
        </v-col>

        <!-- -------------------------------------------------------------------- -->
        <!-- Project overview -->
        <!-- -------------------------------------------------------------------- -->
        <v-col cols="12">
          <ProjectOverview />
        </v-col>
      </v-row>
    </v-col>

    <v-col cols="12" xl="3" md="4">
      <v-row>
        <!-- -------------------------------------------------------------------- -->
        <!-- Project -->
        <!-- -------------------------------------------------------------------- -->
        <v-col cols="12">
          <ProjectCard />
        </v-col>

        <!-- -------------------------------------------------------------------- -->
        <!-- User card -->
        <!-- -------------------------------------------------------------------- -->
        <v-col cols="12">
          <UserCard />
        </v-col>
      </v-row>
    </v-col>
  </v-row>

  <v-row>
    <!-- -------------------------------------------------------------------- -->
    <!-- Transactions -->
    <!-- -------------------------------------------------------------------- -->
    <v-col cols="12" md="6">
      <TransactionCard />
    </v-col>

    <!-- -------------------------------------------------------------------- -->
    <!-- Total income -->
    <!-- -------------------------------------------------------------------- -->
    <v-col cols="12" md="6">
      <TotalIncome />
    </v-col>
  </v-row>
</template>
