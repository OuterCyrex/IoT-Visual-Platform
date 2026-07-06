import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import OverviewHome from '../views/overview/OverviewHome.vue'
import ScreenProjectsView from '../views/screens/ScreenProjectsView.vue'
import ScreenEditorView from '../views/screens/ScreenEditorView.vue'
import SceneProjectsView from '../views/scenes/SceneProjectsView.vue'
import SceneEditorView from '../views/scenes/SceneEditorView.vue'
import DataSourcesView from '../views/data/DataSourcesView.vue'
import DatasetsView from '../views/data/DatasetsView.vue'
import UserManagementView from '../views/system/UserManagementView.vue'
import ProjectManagementView from '../views/system/ProjectManagementView.vue'
import SystemSettingsView from '../views/system/SystemSettingsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
          meta: { title: '大屏项目', section: 'screen-visualization' },
        },
        {
          path: 'screens/editor',
          name: 'screen-editor',
          component: ScreenEditorView,
          meta: { title: '2D 编辑器', section: 'screen-visualization' },
        },
        {
          path: 'scenes',
          name: 'scenes',
          component: SceneProjectsView,
          meta: { title: '三维场景', section: 'scene-visualization' },
        },
        {
          path: 'scenes/editor',
          name: 'scene-editor',
          component: SceneEditorView,
          meta: { title: '3D 编辑器', section: 'scene-visualization' },
        },
        {
          path: 'data-sources',
          name: 'data-sources',
          component: DataSourcesView,
          meta: { title: '数据源管理', section: 'data-management' },
        },
        {
          path: 'datasets',
          name: 'datasets',
          component: DatasetsView,
          meta: { title: '数据集管理', section: 'data-management' },
        },
        {
          path: 'users',
          name: 'users',
          component: UserManagementView,
          meta: { title: '用户管理', section: 'system-management' },
        },
        {
          path: 'projects',
          name: 'projects',
          component: ProjectManagementView,
          meta: { title: '项目管理', section: 'system-management' },
        },
        {
          path: 'settings',
          name: 'settings',
          component: SystemSettingsView,
          meta: { title: '系统设置', section: 'system-management' },
        },
      ],
    },
  ],
})

export default router
