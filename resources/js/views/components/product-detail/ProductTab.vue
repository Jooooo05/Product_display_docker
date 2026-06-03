<script setup>
import { ref } from 'vue'
import ProductFeatures from './ProductFeatures.vue'
import ProductSpecifications from './ProductSpecifications.vue'
import ProductDescriptions from './ProductDescriptions.vue'
// import ProductReview from './ProductReview.vue'

const tab = ref('description')

const props = defineProps({
  description: {
    type: String,
    default: '',
  },
  features: {
    type: String,
    default: '',
  },
  specifications: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <div>
    <v-tabs v-model="tab" color="primary" class="border-bottom">
      <v-tab value="description">Description</v-tab>
      <v-tab value="features">Features</v-tab>
      <v-tab value="specifications">Specifications</v-tab>
      <!-- <v-tab value="review">
        Review
        <v-chip color="secondary" size="small" class="ms-1">275</v-chip>
      </v-tab> -->
    </v-tabs>
    <div class="mt-5">
      <v-window v-model="tab" class="mx-n6 px-6">
        <v-window-item value="description">
          <ProductDescriptions :content="props.description" />
        </v-window-item>  
        <v-window-item value="features">
          <ProductFeatures :content="props.features" />
        </v-window-item>
        <v-window-item value="specifications">
          <ProductSpecifications :content="props.specifications" />
        </v-window-item>
        <!-- <v-window-item value="review">
          <ProductReview />
        </v-window-item> -->
      </v-window>
    </div>
  </div>
</template>