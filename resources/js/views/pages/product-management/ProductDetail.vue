<script setup lang="ts">
import ProductDetail from '@/views/components/product-detail/ProductDetail.vue';
import ProductTab from '@/views/components/product-detail/ProductTab.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const productId = Number(route.params.id);
</script>

<template>
  <v-card elevation="0" variant="outlined" rounded="lg" class="bg-surface mt-2 mb-6">
    <v-card-text>
      <ProductDetail :id="productId" mode="admin" />
    </v-card-text>
  </v-card>

  <!-- <v-row>
    <v-col cols="12" >
      <v-card elevation="0" variant="outlined" class="bg-surface" rounded="lg">
        <v-card-text>
          <ProductTab />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row> -->
</template>