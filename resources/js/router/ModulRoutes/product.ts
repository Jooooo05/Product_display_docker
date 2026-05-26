const ProductRoute = [
    {
        name: 'Product List',
        path: '/product/list',
        component: () => import('@/views/pages/product-management/ProductList.vue'),
        meta: {
            permissions: ['product-management.access']
        }
    },
    {
        name: 'Product Create',
        path: '/product/create',
        component: () => import('@/views/pages/product-management/ProductForm.vue'),
        meta: {
            permissions: ['product-management.create']
        }
    },
    {
        name: 'Product Edit',
        path: '/product/:id/edit',
        props: true,
        component: () => import('@/views/pages/product-management/ProductForm.vue'),
        meta: {
            permissions: ['product-management.edit']
        }
    }
];

export default ProductRoute;
