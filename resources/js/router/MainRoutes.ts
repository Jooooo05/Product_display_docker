import UserRoute from "./ModulRoutes/user-route";
import RoleRoute from "./ModulRoutes/role-route";

const MainRoutes = {
  path: '/main',
  meta: {
    requiresAuth: true
  },
  redirect: '/',
  component: () => import('@/layouts/dashboard/DashboardLayout.vue'),
  children: [
    {
      name: 'Starter',
      path: '/',
      component: () => import('@/views/StarterPage.vue')
    },
    ...UserRoute,
    ...RoleRoute
  ]
};

export default MainRoutes;
