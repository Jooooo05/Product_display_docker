const UserRoute = [
    {
        name: 'User List',
        path: '/user/list',
        component: () => import('@/views/pages/user-management/UserList.vue'),
        meta: {
            permissions: ['user-management.access']
        }
    },
    {
        name: 'User Create',
        path: '/user/create',
        component: () => import('@/views/pages/user-management/UserCreate.vue'),
        meta: {
            permissions: ['user-management.create']
        }
    },
    {
        name: 'User Edit',
        path: '/user/edit/:id',
        component: () => import('@/views/pages/user-management/UserCreate.vue'),
        meta: {
            permissions: ['user-management.edit']
        }
    },
    {
        path: '/user/detail/:id',
        name: 'UserDetail',
        component: () => import('@/views/pages/user-management/UserDetail.vue'),
        meta: {
            permissions: ['user-management.read']
        }
    },
];

export default UserRoute;
