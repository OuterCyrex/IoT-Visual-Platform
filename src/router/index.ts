import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import OverviewHome from '../views/overview/OverviewHome.vue'
import ScreenProjectsView from '../views/screens/ScreenProjectsView.vue'
import ScreenEditor from '../views/screens/ScreenEditor.vue'
import SceneProjectsView from '../views/scenes/SceneProjectsView.vue'
import DataSourcesView from '../views/data/DataSourcesView.vue'
import DatasetsView from '../views/data/DatasetsView.vue'
import UserManagementView from '../views/system/UserManagementView.vue'
import ProjectManagementView from '../views/system/ProjectManagementView.vue'
import SystemSettingsView from '../views/system/SystemSettingsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { fullscreen: true },
    },
    {
      path: '/',
      component: DashboardLayout,
      redirect: '/overview',
      children: [
        {
          path: 'overview',
          name: 'overview',
          component: OverviewHome,
          meta: { title: '平台概览', section: 'overview' },
        },
        {
          path: 'screens',
          name: 'screens',
          component: ScreenProjectsView,
          meta: { title: '大屏可视化', section: 'screen-visualization', permission: 'screen:read' },
        },
        {
          path: 'screens/:id/editor',
          name: 'screen-editor',
          component: ScreenEditor,
          meta: { title: '大屏编辑器', section: 'screen-editor', fullscreen: true, permission: 'screen:write' },
        },
        {
          path: 'screens/:id/preview',
          name: 'screen-preview',
          component: () => import('../views/screens/ScreenPreview.vue'),
          meta: { title: '大屏预览', section: 'screen-visualization', fullscreen: true, permission: 'screen:read' },
        },
        {
          path: 'scenes',
          name: 'scenes',
          component: SceneProjectsView,
          meta: { title: '三维可视化', section: 'scene-visualization', permission: 'scene:read' },
        },
        {
          path: 'scenes/:id/editor',
          name: 'scene-editor',
          component: () => import('../views/scenes/SceneEditor.vue'),
          meta: { title: '三维编辑器', section: 'scene-visualization', fullscreen: true, permission: 'scene:write' },
        },
        {
          path: 'scenes/:id/preview',
          name: 'scene-preview',
          component: () => import('../views/scenes/ScenePreview.vue'),
          meta: { title: '三维预览', section: 'scene-visualization', fullscreen: true, permission: 'scene:read' },
        },
        {
          path: 'data-sources',
          name: 'data-sources',
          component: DataSourcesView,
          meta: { title: '数据源管理', section: 'data-management', permission: 'data-source:read' },
        },
        {
          path: 'datasets',
          name: 'datasets',
          component: DatasetsView,
          meta: { title: '数据集管理', section: 'data-management', permission: 'dataset:read' },
        },
        {
          path: 'users',
          name: 'users',
          component: UserManagementView,
          meta: { title: '用户管理', section: 'system-management', permission: 'user:read' },
        },
        {
          path: 'projects',
          name: 'projects',
          component: ProjectManagementView,
          meta: { title: '项目管理', section: 'system-management', permission: 'project:read' },
        },
        {
          path: 'settings',
          name: 'settings',
          component: SystemSettingsView,
          meta: { title: '系统设置', section: 'system-management', permission: 'system:write' },
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')
  const permissionsStr = localStorage.getItem('auth_permissions')
  const userPermissions: string[] = permissionsStr ? JSON.parse(permissionsStr) : []

  if (to.name !== 'login' && !token) {
    next({ name: 'login' })
  } else if (
    to.meta.permission &&
    !(
      userPermissions.includes(to.meta.permission as string) ||
      (to.meta.permission === 'scene:read' && userPermissions.includes('scene:write'))
    )
  ) {
    ElMessage.error('您没有权限访问该页面！')
    if (from.name) {
      next(false)
    } else {
      next({ name: 'overview' })
    }
  } else {
    next()
  }
})

export default router

