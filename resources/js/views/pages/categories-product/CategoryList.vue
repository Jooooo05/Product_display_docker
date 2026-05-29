<script>
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue";
import UiParentCard from "@/components/shared/UiParentCard.vue";
import CardHeaderFooter from "@/components/shared/CardHeaderFooter.vue";
import DataTableCard from "@/components/shared/DataTableCard.vue";
import FormHorizontal from "@/components/shared/FormHorizontal.vue";
import PermissionTable from "@/components/shared/PermissionTable.vue";
import { mapStores } from "pinia";
import { useCategoryStore } from "@/stores/category-management/categories-store";

export default {
    name: "CategoryPage",
    components: {
        BaseBreadcrumb,
        UiParentCard,
        CardHeaderFooter,
        DataTableCard,
        FormHorizontal,
        PermissionTable,
    },
    data() {
        return {
            dialogCategory: false,
            categoryName: "",
            editedCategoryId: null,
            page: {
                title: "Categories Product",
            },
            breadcrumbs: [
                {
                    title: "Product Display",
                    disabled: true,
                    to: "#",
                },
            ],
            headers: [
                {
                    title: "No",
                    key: "no",
                    width: "50px",
                    sortable: false,
                },
                {
                    title: "Category Name",
                    key: "name",
                    align: "start",
                },
                // {
                //     title: "Status",
                //     key: "status",
                //     align: "center",
                //     sortable: false,
                // },
                {
                    title: "Action",
                    key: "action",
                    align: "center",
                    sortable: false,
                },
            ],
            items: [],
            selectAll: false,
            searchValue: "",
            loading: false,
            isSubmitting: false,
            snackbar: {
                show: false,
                message: "",
                color: "success",
            },
        };
    },
    computed: {
        ...mapStores(useCategoryStore),
        categoryItems() {
            return this.categoryStore.listItems;
        },
        isLoading() {
            return this.categoryStore.loading;
        },
    },
    created() {
        this.categoryStore.fetchCategories();
    },
    methods: {
        // fetchData removed


        async submitCategory() {
            if (!this.categoryName) {
                this.snackbar = {
                    show: true,
                    message: "Category Name is required",
                    color: "error",
                };
                return;
            }

            this.isSubmitting = true;

            try {
                this.categoryStore.form.name = this.categoryName;
                if (this.editedCategoryId) {
                    await this.categoryStore.updateCategory(this.editedCategoryId);
                } else {
                    await this.categoryStore.createCategory();
                }

                const action = this.editedCategoryId ? "updated" : "created";
                this.snackbar = {
                    show: true,
                    message: `Category ${action} successfully`,
                    color: "success",
                };
                this.dialogCategory = false;
                // Reset form
                this.resetForm();
            } catch (error) {
                this.snackbar = {
                    show: true,
                    message: error.message || "Failed to save category",
                    color: "error",
                };
            } finally {
                this.isSubmitting = false;
            }
        },
        resetForm() {
            this.categoryName = "";
            this.editedCategoryId = null;
        },
        openCreateDialog() {
            this.resetForm();
            this.dialogCategory = true;
        },
        openEditDialog(item) {
            this.editedCategoryId = item.id;
            this.categoryName = item.name;
            this.dialogCategory = true;
        },
        openDeleteDialog(item) {
            this.$swal
                .fire({
                    customClass: {
                        popup: "bg-containerBg",
                    },
                    title: "Are you sure?",
                    text: "You won't be able to revert this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, delete it!",
                })
                .then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            await this.categoryStore.deleteCategory(item.id);
                            this.$swal.fire({
                                customClass: {
                                    popup: "bg-containerBg",
                                },
                                title: "Deleted!",
                                text: "Category has been deleted.",
                                icon: "success",
                            });
                        } catch (error) {
                            this.$swal.fire({
                                customClass: {
                                    popup: "bg-containerBg",
                                },
                                title: "Error!",
                                text: error.message || "Failed to delete category",
                                icon: "error",
                            });
                        }
                    }
                });
        },
    },
};
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
    <v-snackbar
        variant="flat"
        rounded="md"
        class="text-surface"
        v-model="snackbar.show"
        :color="snackbar.color"
        location="top right"
        :timeout="3000"
    >
        <SvgSprite
            name="custom-info-circle-outline"
            v-if="snackbar.color === 'error'"
            class="me-1"
            style="width: 16px; height: 16px"
        />
        <SvgSprite
            name="custom-checkbox-marked-circle-outline"
            v-else
            class="me-1"
            style="width: 16px; height: 16px"
        />
        {{ snackbar.message }}
    </v-snackbar>
    <v-row>
        <v-col cols="12" md="12">
            <DataTableCard>
                <template #search>
                    <v-text-field
                        type="text"
                        variant="outlined"
                        persistent-placeholder
                        placeholder="Search Categories"
                        v-model="searchValue"
                        density="comfortable"
                        hide-details
                    >
                        <template v-slot:prepend-inner>
                            <SvgSprite
                                name="custom-search"
                                class="text-lightText"
                                style="width: 14px; height: 14px"
                            />
                        </template>
                    </v-text-field>
                </template>
                <template #header>
                    <v-btn
                        v-permission="'product-management.create'"
                        @click="openCreateDialog"
                        color="primary"
                        variant="text"
                        aria-label="print"
                        rounded="md"
                    >
                        <SvgSprite
                            name="custom-plus"
                            class="me-1"
                            style="width: 14px; height: 14px"
                        />Create
                    </v-btn>
                </template>
                <!-- Create Edit Category -->
                <v-dialog
                    v-model="dialogCategory"
                    max-width="400px"
                    persistent
                >
                    <v-card rounded="lg">
                        <v-card-title class="px-6 pt-5 pb-2 text-subtitle-1 font-weight-semibold">
                            {{ editedCategoryId ? 'Edit Category' : 'Add Category' }}
                        </v-card-title>

                        <v-card-text class="px-6 pb-4">
                            <v-label class="text-caption font-weight-medium mb-1 d-block">
                                Category Name <span class="text-error">*</span>
                            </v-label>
                            <v-text-field
                                v-model="categoryName"
                                placeholder="e.g., Electronics"
                                variant="outlined"
                                density="comfortable"
                                hide-details
                                autofocus
                            />
                        </v-card-text>

                        <v-divider />

                        <v-card-actions class="px-6 py-4 ga-2">
                            <v-spacer />
                            <v-btn
                                variant="text"
                                rounded="md"
                                @click="dialogCategory = false"
                            >
                                Cancel
                            </v-btn>
                            <v-btn
                                color="primary"
                                variant="flat"
                                rounded="md"
                                :loading="isSubmitting"
                                @click="submitCategory"
                            >
                                {{ editedCategoryId ? 'Update' : 'Add' }}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                
                <v-data-table
                    :headers="headers"
                    :items="categoryItems"
                    :search="searchValue"
                    :loading="isLoading"
                    class="customize-table"
                >
                    <template #loading>
                        <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
                    </template>
                    <template v-slot:item.no="{ index }">
                        {{ index + 1 }}
                    </template>
                    <!-- <template v-slot:item.status="{ item }">
                        <v-chip
                            color="success"
                            variant="flat"
                            size="small"
                            v-if="item.users_count > 0"
                            >Active</v-chip
                        >
                        <v-chip color="error" variant="flat" size="small" v-else
                            >Inactive</v-chip
                        >
                    </template> -->
                    <template v-slot:item.action="{ item }">
                        <v-btn
                            icon
                            variant="text"
                            color="primary"
                            size="small"
                            rounded="md"
                            v-permission="'role-management.edit'"
                            @click="openEditDialog(item)"
                            :disabled="item.name === 'Super Admin'"
                        >
                            <SvgSprite
                                name="custom-edit-outline"
                                style="width: 18px; height: 18px"
                            />
                        </v-btn>
                        <v-btn
                            icon
                            variant="text"
                            color="error"
                            size="small"
                            rounded="md"
                            v-permission="'role-management.delete'"
                            @click="openDeleteDialog(item)"
                            :disabled="item.name === 'Super Admin'"
                        >
                            <SvgSprite
                                name="custom-trash"
                                style="width: 18px; height: 18px"
                            />
                        </v-btn>
                    </template>
                </v-data-table>
            </DataTableCard>
        </v-col>
    </v-row>
</template>
