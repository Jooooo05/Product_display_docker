<script setup lang="ts">
import { ref } from "vue";

import UiParentCard from "@/components/shared/UiParentCard.vue";
import HorizontalHeader from "@/layouts/dashboard/horizontal-header/HorizontalHeader.vue";
import ProductListing from "@/components/display/ProductListing.vue"; // sesuaikan path-nya

const page = ref({ title: "Product Listing" });
</script>

<template>
    <v-app>
        <HorizontalHeader />
        <v-row>
            <v-col cols="12" md="12">
                <UiParentCard title="Products">
                    <ProductListing />
                </UiParentCard>
            </v-col>
        </v-row>
    </v-app>
</template>