<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useProductStore } from "@/stores/product-management/product-store";
import { useCategoryStore } from "@/stores/category-management/categories-store";
const { appContext } = getCurrentInstance()!
const filters = appContext.config.globalProperties.filters
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue";
import SkeletonLoader from "@/components/shared/SkeletonLoader.vue";
import Swal from "sweetalert2";


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
const formValid = ref(false);
const isLoading = ref(false);
const formRef = ref<any>(null)
const productForm = ref({
    name: "",
    description: "",
    features: "", 
    specifications: "",
    originalPrice: null as number | null,
    dealerPrice: null as number | null,
    stockStatus: 'available' as 'available' | 'low_stock' | 'out_of_stock',
    sku: "",
    categories: [] as number[],
    status: "Active",
});

// ============================================================
// STATE — Image Upload
// ============================================================
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const isDragging = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB dalam bytes

const validateAndSetFile = (file : any) => {
    if (!file) return;

    // Cek tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        Swal.fire({
            icon: 'error',
            title: 'Format File Tidak Didukung',
            text: 'Silakan upload file dengan format JPG, PNG, atau WEBP.',
            confirmButtonColor: '#d33',
        });
        return;
    }

    // Cek ukuran file
    if (file.size > MAX_FILE_SIZE) {
        Swal.fire({
            icon: 'error',
            title: 'Ukuran File Terlalu Besar',
            text: `Ukuran file (${(file.size / 1024 / 1024).toFixed(2)} MB) melebihi batas maksimal 2MB.`,
            confirmButtonColor: '#d33',
        });
        return;
    }

    // Revoke preview lama sebelum bikin yang baru
    if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value);
    }

    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
};

const onFileSelected = (event : Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;
    validateAndSetFile(file);
};

const onDrop = (event : DragEvent) => {
    isDragging.value = false;
    const file = event.dataTransfer?.files?.[0] ?? null;
    validateAndSetFile(file);
};

const removeImage = () => {
    if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value);
    }
    imageFile.value = null;
    imagePreview.value = null;
    if (fileInputRef.value) {
        fileInputRef.value.value = ''; // reset input
    }
};

const triggerFileInput = () => {
    fileInputRef.value?.click();
};


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
    required: (v: any) => (v !== null && v !== undefined && String(v).trim() !== '') || "Field is required",
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
    // Trigger validasi semua field sekaligus
    const { valid } = await formRef.value.validate()

    if (!valid) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please fill in all required fields correctly.',
        });
        return;
    }
    isLoading.value = true;
    useAuthStore().isLoadingUniversal = true; // Aktifkan loading universal
    console.log("Submitting form with data:", productForm.value);

    try {
        // Mapping balik dari productForm (camelCase) ke store.form (snake_case)
        productStore.form.name = productForm.value.name;
        productStore.form.description = productForm.value.description;
        productStore.form.features = productForm.value.features;
        productStore.form.specifications = productForm.value.specifications;
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
        useAuthStore().isLoadingUniversal = false; // Matikan loading universal
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: `Product has been ${isEditMode.value ? 'updated' : 'created'} successfully.`,
        });

    } catch (err : any) {
        // Error sudah di-handle di store (productStore.error)
        // Bisa tambah snackbar/alert di sini kalau mau
        useAuthStore().isLoadingUniversal = false; // Matikan loading universal
        console.error("Failed to submit form:", err);
        Swal.fire({
            icon: 'error',
            title: 'Submission Failed',
            text: err.message || 'An error occurred while submitting the form.',
        });
    } finally {
        isLoading.value = false;
    }
};

const resetForm = () => {
    productForm.value = {
        name: "",
        description: "",
        features: "",
        specifications: "",
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
const isReady = ref(false)
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
            features: f.features || "",
            specifications: f.specifications || "",
            sku: f.sku,
            originalPrice: f.original_price,       // <- store pakai snak_case
            dealerPrice: f.dealer_price,          // <- store pakai snak_case
            stockStatus: f.stock_status,          // <- store pakai snak_case
            categories: f.categories || [],
            status: f.status,
        }

        // Kalau ada existing image, tampilkan previes dari URL nya
        const product = productStore.listItems.find(p => p.id === Number(props.id));
        if (product?.image) {
            imagePreview.value = `${import.meta.env.VITE_APP_URL}/storage/${product.image}`;
        }
    }

    isReady.value = true // semua fetch selesai, baru tampilkan form
});
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
    <v-row>
        <v-col cols="12">
            <SkeletonLoader v-if="!isReady" />
            <v-form ref="formRef" v-else v-model="formValid">
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
                                <!-- Baris baru untuk Features dan Specifications (2 kolom) -->
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <v-label class="text-caption font-weight-medium mb-1 d-block">
                                            Features
                                            <span class="text-error">*</span>
                                        </v-label>
                                        <v-textarea
                                            v-model="productForm.features"
                                            placeholder="e.g., 14-inch Retina display, 8GB RAM, Backlit keyboard"
                                            variant="outlined"
                                            color="primary"
                                            rows="4"
                                            counter="2000"
                                            :rules="[
                                                rules.required,
                                                rules.minLength(10),
                                            ]"
                                        />
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-label class="text-caption font-weight-medium mb-1 d-block">
                                            Specifications
                                            <span class="text-error">*</span>
                                        </v-label>
                                        <v-textarea
                                            v-model="productForm.specifications"
                                            placeholder="e.g., Processor: M2, Weight: 1.2kg, Battery: 18 hours"
                                            variant="outlined"
                                            color="primary"
                                            rows="4"
                                            counter="2000"
                                            :rules="[
                                                rules.required,
                                                rules.minLength(10),
                                            ]"
                                        />
                                    </v-col>
                                </v-row>

                                <!-- SKU -->
                                <v-label class="text-caption font-weight-medium mb-1 d-block">
                                    SKU
                                    <span class="text-error">*</span>
                                </v-label>
                                <v-text-field
                                    v-model="productForm.sku"
                                    placeholder="e.g., SKU-001-ABC"
                                    variant="outlined"
                                    density="comfortable"
                                    color="primary"
                                    :rules="[
                                        rules.required,
                                        rules.maxLength(50)
                                    ]"
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
                                            User Price
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
                                            prefix="Rp"
                                            :rules="[rules.required]"
                                        />
                                    </v-col>

                                    <!-- Dealer Price -->
                                    <v-col cols="12" sm="6">
                                        <v-label class="text-caption font-weight-medium mb-1 d-block">
                                            Dealer Price
                                            <span class="text-error">*</span>
                                        </v-label>
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
                                            prefix="Rp"
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
                                        size="x-small"
                                        color="error"
                                        variant="flat"
                                        class="remove-image-btn"
                                        @click="removeImage"
                                    >
                                        <SvgSprite name="custom-close" style="width: 16px; height: 16px; transform: rotate(45deg)" />
                                    </v-btn>
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
                                    <SvgSprite name="custom-image" style="width: 36px; height: 36px" class="mb-3 text-secondary" />
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
                                    @click="router.push('/product/list')"
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
    border: 2px dashed rgba(var(--v-border-color), 0.3);
    border-radius: 12px;
    padding: 32px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    text-align: center;
    border-color: rgb(var(--v-theme-surface-variant));
    background: rgba(var(--v-theme-surface-variant), 0.04);
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
