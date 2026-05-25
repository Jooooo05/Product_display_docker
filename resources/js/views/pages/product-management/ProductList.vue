<script setup lang="ts">
import { ref, shallowRef, onMounted } from 'vue';
import { useProductStore } from '@/stores/product-management/product-store';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import ProductListing from '@/components/display/ProductListing.vue';

const page = ref({ title: 'Product Management' });
const breadcrumbs = shallowRef([
  {
    title: 'Product Management List',
    disabled: true,
    href: '#',
    description: ''
  }
]);

// STORES
const productStore = useProductStore();

// STATE
onMounted(async () => {
  console.log('ProductList component mounted');
  // await productStore.fetchProducts();
});
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" md="12">
      <ProductListing>
          <template #actions>
              <v-btn
                  color="primary"
                  variant="flat"
                  rounded="md"
                  to="/product/create"
              >
                  Create Product
              </v-btn>
          </template>
      </ProductListing>
    </v-col>
  </v-row>
</template>
