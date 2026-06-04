<script setup lang="ts">
import HorizontalHeader from "@/layouts/dashboard/horizontal-header/HorizontalHeader.vue";
import ProductDetail from "@/views/components/product-detail/ProductDetail.vue";
import { useRoute } from "vue-router";

const route = useRoute();
const productId = Number(route.params.id);
</script>

<template>
    <v-app>
        <HorizontalHeader />
        <v-container fluid class="pt-5 mt-5 " >
    
            <v-container class="py-6 my-6">
                <v-card
                    elevation="0"
                    variant="outlined"
                    rounded="lg"
                    class="bg-surface overflow-hidden"
                >
                    <ProductDetail :id="productId" mode="public" />
                </v-card>
            </v-container>
        </v-container>
    </v-app>
</template>

<style scoped>
.public-navbar {
    border-bottom: 1px solid
    rgba(var(--v-border-color), var(--v-border-opacity));
    background: rgb(var(--v-theme-surface));
}
</style>
