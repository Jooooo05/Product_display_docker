const ProductRoute = [
    {
        name: 'Product List',
        path: '/product/list',
        component: () => import('@/views/pages/product-management/ProductList.vue'),
        meta: {
            // permissions: ['role-management.access']
        }
    },
    {
        name: 'Product Create',
        path: '/product/create',
        component: () => import('@/views/pages/product-management/ProductForm.vue'),
        meta: {
            // permissions: ['role-management.access']
        }
    },
    {
        name: 'Product Edit',
        path: '/product/:id/edit',
        component: () => import('@/views/pages/product-management/ProductForm.vue'),
        meta: {
            // permissions: ['role-management.access']
        }
    }
];

export default ProductRoute;
