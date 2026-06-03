<script setup>
import { ref, onMounted } from "vue";
import { useProductStore } from "@/stores/product-management/product-store.js";
import SvgSprite from "@/components/shared/SvgSprite.vue";
import ProductTab from "./ProductTab.vue";

const props = defineProps({
    id: {
        type: Number,
        required: true,
    },
});

const store = useProductStore();
const appUrl = import.meta.env.VITE_APP_URL;
const defaultImage = '/assets/images/placeholder_image.jpg';

const product = ref(null);

const productImageUrl = () => {
    if (!product.value?.image) return defaultImage;
    return `${appUrl}/storage/${product.value.image}`;
};

onMounted(async () => {
    product.value = await store.fetchProduct(props.id);

    console.log('Product Detail:', product.value);
});
</script>

<template>
    <div v-if="product">
        <v-row>
            <!-- Kolom gambar -->
            <v-col md="4" sm="12" cols="12">
                <v-card variant="outlined" rounded="lg" class="overflow-hidden">
                    <v-img
                        :src="productImageUrl()"
                        :alt="product.name"
                        aspect-ratio="4/3"
                        cover
                        class="bg-grey-lighten-3"
                    />
                </v-card>
            </v-col>

            <!-- Kolom informasi produk -->
            <v-col md="8" sm="12" cols="12">
                <div class="d-flex align-top">
                    <div class="d-flex flex-grow-1 align-items-start gap-3">
                        <h3 class="text-h3 mr-2">
                            {{ product.name }}
                        </h3>
                        <v-chip color="info" variant="outlined" size="small" class="mr-2">
                            {{ product.status }}
                        </v-chip>
                        <!-- nanti cek role usernya dulu -->
                        <v-chip color="success" size="small" label >
                            {{ product.stock_status }}
                        </v-chip>
                    </div>
                </div>
                <!-- <p class="v-col-lg-10 px-0 mb-0 text-h6 text-lightText" style="white-space: pre-line">
                    {{ getProduct().description }}
                </p> -->
                <v-row>
                    <v-col lg="12">
                        <ProductTab 
                            :description="product.description"
                            :features="product.features"
                            :specifications="product.specifications"
                        />
                        <!-- <div class="d-flex flex-wrap ga-4">
                            <v-btn color="secondary" rounded="md" size="large" variant="outlined">
                                <template v-slot:prepend>
                                    <SvgSprite name="custom-add-cart" style="width: 18px; height: 18px" />
                                </template>
                                Ask Something?
                            </v-btn>
                        </div> -->
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </div>
</template>