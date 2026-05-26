<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useProductStore } from "@/stores/product-management/product-store";
import { useCategoryStore } from "@/stores/category-management/categories-store";
import { getCurrentInstance } from "vue"
const { appContext } = getCurrentInstance()!
const filters = appContext.config.globalProperties.filters

import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue";


// ============================================================
// PROPS
// ============================================================
const props = defineProps({
    id: {
        type: String,
        default: null,
    },
});

// ============================================================
// ROUTER
// ============================================================
const router = useRouter();

// ============================================================
// STATE — Page & Breadcrumb
// ============================================================
const isEditMode = computed(() => !!props.id);
const productStore = useProductStore();
const categoryStore = useCategoryStore();

const page = computed(() => ({
    title: isEditMode.value ? "Edit Product" : "Create Product",
}));

const breadcrumbs = ref([
    {
        title: "Product Management",
        disabled: false,
        href: "/ecommerce/product",
        description: "",
    },
]);

// ============================================================
// STATE — Options
// ============================================================

const statusOptions = ["Active", "Inactive", "Draft"];

const stockStatusOptions = [
    { title: 'Available', value: 'available' },
    { title: 'Low stock', value: 'low_stock' },
    { title: 'Out of stock', value: 'out_of_stock' },
];

// ============================================================
// STATE — Form
// ============================================================
const productFormRef = ref(null);
const formValid = ref(false);
const isLoading = ref(false);

const productForm = ref({
    name: "",
    description: "",
    originalPrice: null as number | null,
    dealerPrice: null as number | null,
    stockStatus: 'available' as 'available' | 'low_stock' | 'out_of_stock',
    sku: "",
    categories: [] as string[],
    status: "Active",
});

// ============================================================
// STATE — Image Upload
// ============================================================
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const isDragging = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => fileInputRef.value?.click();

const onFileSelected = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        processFile(input.files[0]);
    }
};

const onDrop = (event: DragEvent) => {
    isDragging.value = false;
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith("image/")) {
        processFile(file);
    }
};

const processFile = (file: File) => {
    imageFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
};

const removeImage = () => {
    imageFile.value = null;
    imagePreview.value = null;
    if (fileInputRef.value) fileInputRef.value.value = "";
};

// ============================================================
// STATE — Tags Input
// ============================================================
const tagInput = ref("");


// ============================================================
// STATE — Currency Format
// ============================================================

const onPriceInput = (field: "originalPrice" | "dealerPrice", event: Event) => {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/[^0-9]/g, "");
    productForm.value[field] = raw === "" ? null : Number(raw);
};

// ============================================================
// VALIDATION RULES
// ============================================================
const rules = {
    required: (v: any) => !!v || "Field is required",
    minLength: (min: number) => (v: string) =>
        (v && v.length >= min) || `Minimum ${min} characters`,
    maxLength: (max: number) => (v: string) =>
        !v || v.length <= max || `Maximum ${max} characters`,
    positive: (v: any) => !v || Number(v) > 0 || "Must be greater than 0",
};

// ============================================================
// FUNCTIONS — Submit & Reset
// ============================================================
const submitForm = async () => {
    isLoading.value = true;

    console.log("Submitting form with data:", productForm.value);

    try {
        // Mapping balik dari productForm (camelCase) ke store.form (snake_case)
        productStore.form.name = productForm.value.name;
        productStore.form.description = productForm.value.description;
        productStore.form.sku = productForm.value.sku;
        productStore.form.original_price = productForm.value.originalPrice;
        productStore.form.dealer_price = productForm.value.dealerPrice;
        productStore.form.stock_status = productForm.value.stockStatus;
        productStore.form.categories = productForm.value.categories;
        productStore.form.status = productForm.value.status as any;

        // Kasih tau store file image yang dipilh user
        productStore.setImageFile(imageFile.value);

        if (isEditMode.value) {
            await productStore.updateProduct(Number(props.id));
        } else {
            await productStore.createProduct();
            resetForm();
        }

    } catch (err) {
        // Error sudah di-handle di store (productStore.error)
        // Bisa tambah snackbar/alert di sini kalau mau
        console.error("Failed to submit form:", err);
    } finally {
        isLoading.value = false;
    }
};

const resetForm = () => {
    productForm.value = {
        name: "",
        description: "",
        originalPrice: null,
        dealerPrice: null,
        stockStatus: 'available',
        sku: "",
        categories: [],
        status: "Active",
    };
    removeImage();
};

// ============================================================
// LIFECYCLE
// ============================================================
onMounted(async () => {
    await categoryStore.fetchCategories();
    console.log('Fetched categories:', categoryStore.listItems);
    await productStore.fetchProducts();
    

    console.log('check edit mode:', isEditMode.value, 'with ID:', props.id);

    if (isEditMode.value) {
        console.log('Edit mode, fetching product with ID:', props.id);
        await productStore.fetchProduct(Number(props.id));
        // Map dari store.form ke productForm local
        // (nama field store dan form sedikit beda, jadi perlu mapping manual)
        const f = productStore.form;
        productForm.value = {
            name: f.name,
            description: f.description,
            sku: f.sku,
            originalPrice: f.original_price,       // <- store pakai snak_case
            dealerPrice: f.dealer_price,          // <- store pakai snak_case
            stockStatus: f.stock_status,          // <- store pakai snak_case
            categories: f.categories || [],
            status: f.status,
        }

        // Kalau ada existing image, tampilkan previes dari URL nya
        const product = productStore.listItems.find(p => p.id === Number(props.id));
        if (product?.image_url) {
            imagePreview.value = product.image_url;
        }
    }
});
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

    <v-row>
        <v-col cols="12">
            <v-form ref="productFormRef" v-model="formValid">
                <v-row>
                    <!-- ─────────────────────────────────────────────── -->
                    <!-- LEFT COLUMN                                      -->
                    <!-- ─────────────────────────────────────────────── -->
                    <v-col cols="12" lg="8" class="d-flex flex-column">
                        <!-- Card: Basic Info -->
                        <v-card variant="outlined" rounded="lg" class="mb-4">
                            <v-card-item class="px-6 py-4 bg-grey-lighten-5">
                                <div class="d-flex align-center ga-3">
                                    <v-avatar
                                        color="primary"
                                        variant="tonal"
                                        size="36"
                                        rounded="md"
                                    >
                                        <SvgSprite name="custom-shopping-bag" style="width: 16px; height: 16px" />
                                    </v-avatar>
                                    <div>
                                        <v-card-title
                                            class="text-subtitle-1 font-weight-semibold pa-0"
                                            >Product Information</v-card-title
                                        >
                                        <p
                                            class="text-caption text-medium-emphasis mb-0"
                                        >
                                            Product name, description, and SKU
                                        </p>
                                    </div>
                                </div>
                            </v-card-item>
                            <v-divider />
                            <v-card-text class="pa-6">
                                <!-- Product Name -->
                                <v-label
                                    class="text-caption font-weight-medium mb-1 d-block"
                                >
                                    Product Name
                                    <span class="text-error">*</span>
                                </v-label>
                                <v-text-field
                                    v-model="productForm.name"
                                    placeholder="e.g., Apple MacBook Air M2"
                                    variant="outlined"
                                    density="comfortable"
                                    color="primary"
                                    :rules="[
                                        rules.required,
                                        rules.minLength(3),
                                        rules.maxLength(100),
                                    ]"
                                    counter="100"
                                    class="mb-4"
                                />

                                <!-- Description -->
                                <v-label
                                    class="text-caption font-weight-medium mb-1 d-block"
                                >
                                    Description
                                    <span class="text-error">*</span>
                                </v-label>
                                <v-textarea
                                    v-model="productForm.description"
                                    placeholder="Describe the product in detail…"
                                    variant="outlined"
                                    color="primary"
                                    rows="4"
                                    :rules="[
                                        rules.required,
                                        rules.minLength(10),
                                    ]"
                                    counter="500"
                                    class="mb-4"
                                />

                                <!-- SKU -->
                                <v-label
                                    class="text-caption font-weight-medium mb-1 d-block"
                                    >SKU</v-label
                                >
                                <v-text-field
                                    v-model="productForm.sku"
                                    placeholder="e.g., SKU-001-ABC"
                                    variant="outlined"
                                    density="comfortable"
                                    color="primary"
                                    :rules="[rules.maxLength(50)]"
                                    hint="Leave blank to auto-generate"
                                    persistent-hint
                                />
                            </v-card-text>
                        </v-card>

                        <!-- Card: Pricing & Stock -->
                        <v-card variant="outlined" rounded="lg" class="mb-4">
                            <v-card-item class="px-6 py-4 bg-grey-lighten-5">
                                <div class="d-flex align-center ga-3">
                                    <v-avatar
                                        color="success"
                                        variant="tonal"
                                        size="36"
                                        rounded="md"
                                    >
                                        <SvgSprite name="custom-dollar-square" style="width: 16px; height: 16px" />
                                    </v-avatar>
                                    <div>
                                        <v-card-title
                                            class="text-subtitle-1 font-weight-semibold pa-0"
                                            >Pricing Product</v-card-title
                                        >
                                        <p
                                            class="text-caption text-medium-emphasis mb-0"
                                        >
                                            Set prices for customer
                                        </p>
                                    </div>
                                </div>
                            </v-card-item>
                            <v-divider />
                            <v-card-text class="pa-6">
                                <v-row>
                                    <!-- Sale Price -->
                                    <v-col cols="12" sm="6">
                                        <v-label
                                            class="text-caption font-weight-medium mb-1 d-block"
                                        >
                                            Original Price
                                            <span class="text-error">*</span>
                                        </v-label>
                                        <v-text-field
                                            :model-value="filters.formatNumber(productForm.originalPrice)"
                                            @input="
                                                onPriceInput(
                                                    'originalPrice',
                                                    $event,
                                                )
                                            "
                                            placeholder="0"
                                            variant="outlined"
                                            density="comfortable"
                                            color="primary"
                                            prefix="$"
                                            :rules="[rules.required]"
                                        />
                                    </v-col>

                                    <!-- Dealer Price -->
                                    <v-col cols="12" sm="6">
                                        <v-label
                                            class="text-caption font-weight-medium mb-1 d-block"
                                            >Dealer Price</v-label
                                        >
                                        <v-text-field
                                            :model-value="
                                                filters.formatNumber(
                                                    productForm.dealerPrice,
                                                )
                                            "
                                            @input="
                                                onPriceInput(
                                                    'dealerPrice',
                                                    $event,
                                                )
                                            "
                                            placeholder="0"
                                            variant="outlined"
                                            density="comfortable"
                                            color="primary"
                                            prefix="$"
                                            hint="Shown as strikethrough"
                                            persistent-hint
                                        />
                                    </v-col>


                                </v-row>

                                <!-- Discount badge preview -->
                                <v-alert
                                    v-if="
                                        productForm.originalPrice && productForm.dealerPrice && productForm.originalPrice > productForm.dealerPrice
                                    "
                                    type="success"
                                    variant="tonal"
                                    density="compact"
                                    rounded="md"
                                    icon="mdi-sale"
                                    class="mt-2"
                                >
                                    Discount:
                                    <strong>
                                        {{
                                            Math.round(
                                                ((productForm.originalPrice - productForm.dealerPrice) / productForm.originalPrice) * 100,
                                            )
                                        }}% off
                                    </strong>
                                    from original price
                                </v-alert>
                            </v-card-text>
                        </v-card>


                    </v-col>

                    <!-- ─────────────────────────────────────────────── -->
                    <!-- RIGHT COLUMN                                     -->
                    <!-- ─────────────────────────────────────────────── -->
                    <v-col cols="12" lg="4" class="d-flex flex-column">
                        <!-- Card: Product Image -->
                        <v-card variant="outlined" rounded="lg" class="mb-3">
                            <v-card-item class="px-6 py-4 bg-grey-lighten-5">
                                <div class="d-flex align-center ga-3">
                                    <v-avatar
                                        color="info"
                                        variant="tonal"
                                        size="36"
                                        rounded="md"
                                    >
                                        <SvgSprite name="custom-image" style="width: 16px; height: 16px" />
                                    </v-avatar>
                                    <div>
                                        <v-card-title
                                            class="text-subtitle-1 font-weight-semibold pa-0"
                                            >Product Image</v-card-title
                                        >
                                        <p
                                            class="text-caption text-medium-emphasis mb-0"
                                        >
                                            JPG, PNG or WEBP. Max 2MB
                                        </p>
                                    </div>
                                </div>
                            </v-card-item>
                            <v-divider />
                            <v-card-text class="pa-6">
                                <!-- Preview -->
                                <div
                                    v-if="imagePreview"
                                    class="image-preview-wrapper mb-3"
                                >
                                    <v-img
                                        :src="imagePreview"
                                        aspect-ratio="1"
                                        cover
                                        rounded="lg"
                                        class="border"
                                        max-height="170"
                                    />
                                    <v-btn
                                        icon="mdi-close"
                                        size="x-small"
                                        color="error"
                                        variant="flat"
                                        class="remove-image-btn"
                                        @click="removeImage"
                                    />
                                </div>

                                <!-- Dropzone -->
                                <div
                                    v-else
                                    class="dropzone"
                                    :class="{ 'dropzone--active': isDragging }"
                                    @click="triggerFileInput"
                                    @dragover.prevent="isDragging = true"
                                    @dragleave="isDragging = false"
                                    @drop.prevent="onDrop"
                                >
                                    <v-icon
                                        size="36"
                                        color="grey-lighten-1"
                                        class="mb-2"
                                        >mdi-cloud-upload-outline</v-icon
                                    >
                                    <p
                                        class="text-body-2 font-weight-medium mb-1"
                                    >
                                        Click or drag & drop
                                    </p>
                                    <p
                                        class="text-caption text-medium-emphasis mb-0"
                                    >
                                        JPG, PNG, WEBP up to 2MB
                                    </p>
                                </div>

                                <!-- Hidden file input -->
                                <input
                                    ref="fileInputRef"
                                    type="file"
                                    accept="image/*"
                                    class="d-none"
                                    @change="onFileSelected"
                                />

                                <!-- File name -->
                                <p
                                    v-if="imageFile"
                                    class="text-caption text-medium-emphasis mt-2 mb-0"
                                >
                                    <v-icon size="14" class="me-1"
                                        >mdi-paperclip</v-icon
                                    >
                                    {{ imageFile.name }}
                                </p>
                            </v-card-text>
                        </v-card>

                        <!-- Card: Classification -->
                        <v-card variant="outlined" rounded="lg" class="mb-2" style="flex: 1">
                            <v-card-item class="px-6 py-4 bg-grey-lighten-5">
                                <div class="d-flex align-center ga-3">
                                    <v-avatar
                                        color="purple"
                                        variant="tonal"
                                        size="36"
                                        rounded="md"
                                    >
                                        <SvgSprite name="custom-status-outline" style="width: 16px; height: 16px" />
                                    </v-avatar>
                                    <div>
                                        <v-card-title class="text-subtitle-1 font-weight-semibold pa-0">Product Classification</v-card-title>
                                        <p class="text-caption text-medium-emphasis mb-0">
                                            Internal classification only
                                        </p>
                                    </div>
                                </div>
                            </v-card-item>
                            <v-divider />
                            <v-card-text class="pa-6">
                                <!-- Category -->
                                <v-label
                                    class="text-caption font-weight-medium mb-1 d-block"
                                >
                                    Category <span class="text-error">*</span>
                                </v-label>
                                <v-autocomplete
                                    v-model="productForm.categories"
                                    :items="categoryStore.listItems"
                                    item-title="name"
                                    item-value="id"
                                    variant="outlined"
                                    density="comfortable"
                                    color="primary"
                                    multiple
                                    chips
                                    closable-chips
                                    hide-details
                                    class="mb-4"
                                    :rules="[rules.required]"
                                >
                                    <template v-slot:chip="{ props, item }">
                                        <v-chip
                                            v-bind="props"
                                            color="primary"
                                            variant="tonal"
                                            size="small"
                                        >
                                            {{ item.raw.name }}
                                        </v-chip>
                                    </template>
                                </v-autocomplete>



                                <!-- Status -->
                                <v-label
                                    class="text-caption font-weight-medium mb-1 d-block"
                                    >Status</v-label
                                >
                                <v-select
                                    v-model="productForm.status"
                                    :items="statusOptions"
                                    variant="outlined"
                                    density="comfortable"
                                    color="primary"
                                    hide-details
                                >
                                    <template #selection="{ item }">
                                        <v-chip
                                            :color="
                                                item.value === 'Active'
                                                    ? 'success'
                                                    : item.value === 'Draft'
                                                    ? 'warning'
                                                    : 'error'
                                            "
                                            variant="tonal"
                                            size="small"
                                        >
                                            {{ item.value }}
                                        </v-chip>
                                    </template>
                                </v-select>

                                <!-- Stock Availability — Internal Label -->
                                <v-label class="text-caption font-weight-medium mt-4 mb-1 d-block">
                                    Stock availability
                                </v-label>

                                <v-select
                                    v-model="productForm.stockStatus"
                                    :items="stockStatusOptions"
                                    variant="outlined"
                                    density="comfortable"
                                    color="primary"
                                    hide-details
                                >
                                    <template #selection="{ item }">
                                        <v-chip
                                            :color="
                                                item.value === 'available'
                                                    ? 'success'
                                                    : item.value === 'low_stock'
                                                    ? 'warning'
                                                    : 'error'
                                            "
                                            variant="tonal"
                                            size="small"
                                        >
                                            {{ item.title }}
                                        </v-chip>
                                    </template>
                                </v-select>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- ─────────────────────────────────────────────── -->
                <!-- ACTIONS — Full width                            -->
                <!-- ─────────────────────────────────────────────── -->
                <v-row class="mt-2">
                    <v-col cols="12">
                        <v-card variant="outlined" rounded="lg">
                            <v-card-text class="pa-4 d-flex ga-3">
                                <v-btn
                                    color="primary"
                                    variant="flat"
                                    rounded="md"
                                    size="large"
                                    :loading="isLoading"
                                    @click="submitForm"
                                    style="flex: 1;"
                                >
                                    <v-icon start>mdi-check</v-icon>
                                    {{ isEditMode ? "Update Product" : "Create Product" }}
                                </v-btn>
                                <v-btn
                                    color="error"
                                    variant="outlined"
                                    rounded="md"
                                    size="large"
                                    @click="router.push('/ecommerce/product')"
                                    style="flex: 1;"
                                >
                                    Cancel
                                </v-btn>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-form>
        </v-col>
    </v-row>
</template>

<style scoped>
/* Dropzone */
.dropzone {
    border: 2px dashed rgba(0, 0, 0, 0.15);
    border-radius: 12px;
    padding: 32px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
        border-color 0.2s,
        background 0.2s;
    text-align: center;
    background: #fafafa;
}

.dropzone:hover,
.dropzone--active {
    border-color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.04);
}

/* Image preview */
.image-preview-wrapper {
    position: relative;
    display: inline-block;
    width: 100%;
}

.remove-image-btn {
    position: absolute;
    top: 8px;
    right: 8px;
}
</style>
