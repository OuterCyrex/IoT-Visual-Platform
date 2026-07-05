import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import DashboardHome from '../views/DashboardHome.vue'
import SystemSetting from '../views/SystemSetting.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: DashboardLayout,
      redirect: '/dashboard',
      children: [
        { path: 'dashboard', component: DashboardHome },
        { path: 'settings', component: SystemSetting },
      ],
    },
  ],
})

export default router
