<template>
  <router-view v-if="isFullscreen" />
  <div v-else class="min-h-screen bg-slate-100 text-slate-800">
    <div class="flex min-h-screen">
      <aside class="w-72 border-r border-slate-200 bg-slate-950 text-slate-100">
        <div class="border-b border-slate-800 px-6 py-6">
          <div class="text-lg font-semibold tracking-tight">IoT Visual Platform</div>
          <div class="mt-2 text-sm text-slate-400">
            物联网大屏可视化平台
          </div>
        </div>

        <div class="py-5">
          <div
            v-for="group in filteredNavigationGroups"
            :key="group.title"
            class="mb-6"
          >
            <div class="mb-2 px-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              {{ group.title }}
            </div>
            <el-menu
              :default-active="route.path"
              class="border-r-0 bg-transparent"
              background-color="transparent"
              text-color="#cbd5e1"
              active-text-color="#f8fafc"
              router
            >
              <el-menu-item
                v-for="item in group.items"
                :key="item.path"
                :index="item.path"
                class="mb-1 rounded-md"
              >
                <el-icon><component :is="item.icon" /></el-icon>
                <span>{{ item.label }}</span>
              </el-menu-item>
            </el-menu>
          </div>
        </div>
      </aside>

      <main class="flex-1 overflow-auto">
        <header class="border-b border-slate-200 bg-white px-8 py-4">
          <div class="flex items-center justify-between gap-6">
            <div>
              <div class="text-sm text-slate-500">{{ currentSection }}</div>
              <h1 class="mt-1 text-2xl font-semibold text-slate-950">{{ currentTitle }}</h1>
            </div>

            <!-- User Menu Dropdown -->
            <el-dropdown trigger="click" @command="handleCommand">
              <span class="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
                <el-avatar :size="32" class="bg-blue-600 text-white font-bold">{{ avatarText }}</el-avatar>
                <span class="text-sm font-medium text-slate-700">{{ username }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item disabled>角色: {{ userRole }}</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </header>

        <section class="p-8">
          <router-view />
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Box,
  Collection,
  Connection,
  DataBoard,
  Monitor,
  Setting,
  User,
} from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const userStr = localStorage.getItem('auth_user')
const user = userStr ? JSON.parse(userStr) : null
const username = computed(() => user?.displayName || '未登录')
const userRole = computed(() => user?.role || '访客')
const avatarText = computed(() => (user?.displayName || 'U').slice(0, 1).toUpperCase())

interface NavItem {
  label: string
  path: string
  icon: any
  permission?: string
}

const navigationGroups: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Overview',
    items: [{ label: '平台概览', path: '/overview', icon: Monitor }],
  },
  {
    title: 'Visualization',
    items: [
      { label: '大屏可视化', path: '/screens', icon: DataBoard, permission: 'screen:read' },
      { label: '三维可视化', path: '/scenes', icon: Box, permission: 'scene:read' },
    ],
  },
  {
    title: 'Data',
    items: [
      { label: '数据源管理', path: '/data-sources', icon: Connection, permission: 'data-source:read' },
      { label: '数据集管理', path: '/datasets', icon: Collection, permission: 'dataset:read' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: '用户管理', path: '/users', icon: User, permission: 'user:read' },
      { label: '项目管理', path: '/projects', icon: DataBoard, permission: 'project:read' },
      { label: '系统设置', path: '/settings', icon: Setting, permission: 'system:write' },
    ],
  },
]

const filteredNavigationGroups = computed(() => {
  const permissionsStr = localStorage.getItem('auth_permissions')
  const userPermissions: string[] = permissionsStr ? JSON.parse(permissionsStr) : []

  return navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.permission || userPermissions.includes(item.permission)),
    }))
    .filter((group) => group.items.length > 0)
})

const sectionLabelMap: Record<string, string> = {
  overview: '平台总览',
  'screen-visualization': '大屏可视化',
  'scene-visualization': '三维可视化',
  'data-management': '数据管理',
  'system-management': '系统管理',
}

const isFullscreen = computed(() => Boolean(route.meta.fullscreen))
const currentTitle = computed(() => String(route.meta.title ?? 'IoT Visual Platform'))
const currentSection = computed(() => sectionLabelMap[String(route.meta.section ?? 'overview')])

function handleCommand(command: string) {
  if (command === 'logout') {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_permissions')
    ElMessage.success('已成功退出登录')
    router.push({ name: 'login' })
  }
}
</script>
