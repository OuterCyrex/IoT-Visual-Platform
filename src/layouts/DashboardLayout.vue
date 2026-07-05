<template>
  <div class="min-h-screen bg-white text-slate-800">
    <div class="flex min-h-screen">
      <aside class="w-64 border-r border-slate-200 bg-white py-6">
        <div class="mb-8 mx-4">
          <div class="text-lg font-semibold">ioT Visual Platform</div>
          <div class="mt-1 text-xs text-slate-500">物联网低代码可视化系统</div>
        </div>

        <el-menu
          :default-active="route.path"
          class="border-r-0"
          text-color="#475569"
          active-text-color="#0f172a"
          router
        >
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </aside>

      <main class="flex-1 overflow-auto bg-slate-50">
        <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h1 class="text-xl font-semibold text-slate-900">后台首页</h1>
          </div>
        </header>

        <section class="p-6">
          <router-view />
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { House, Setting } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
