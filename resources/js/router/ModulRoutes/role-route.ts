const RoleRoute = [
    {
        name: 'Role List',
        path: '/role/list',
        component: () => import('@/views/pages/role-management/RoleList.vue'),
        meta: {
            permissions: ['role-management.access']
        }
    },
];

export default RoleRoute;
