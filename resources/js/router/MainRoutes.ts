import UserRoute from "./ModulRoutes/user-route";
import RoleRoute from "./ModulRoutes/role-route";
import ProductRoute from "./ModulRoutes/product";

const MainRoutes = {
  path: '/main',
  meta: {
    requiresAuth: true
  },
  redirect: '/dashboard',
  component: () => import('@/layouts/dashboard/DashboardLayout.vue'),
  children: [
    {
      name: 'Starter',
      path: '/dashboard',
      component: () => import('@/views/StarterPage.vue')
    },
    ...UserRoute,
    ...RoleRoute,
    ...ProductRoute
  ]
};

export default MainRoutes;
