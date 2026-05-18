const ProductRoute = [
    {
        name: 'Product List',
        path: '/product/list',
        component: () => import('@/views/pages/product-management/ProductList.vue'),
        meta: {
            // permissions: ['role-management.access']
        }
    },
];

export default ProductRoute;
