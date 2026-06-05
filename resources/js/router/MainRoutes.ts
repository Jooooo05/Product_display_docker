import UserRoute from "./ModulRoutes/user-route";
import RoleRoute from "./ModulRoutes/role-route";
import ProductRoute from "./ModulRoutes/product";

const MainRoutes = {
  path: '/main',
  meta: {
    requiresAuth: true,
    requiresSuperAdmin: true,
  },
  redirect: '/dashboard',
  component: () => import('@/layouts/dashboard/DashboardLayout.vue'),
  children: [
    {
      name: 'Starter',
      path: '/dashboard',
      component: () => import('@/views/pages/dashboard/DefaultDashboard.vue'),
    },
    ...UserRoute,
    ...RoleRoute,
    ...ProductRoute
  ]
};

export default MainRoutes;
