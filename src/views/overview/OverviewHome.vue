<template>
  <div class="space-y-6">
    <div class="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
      <div
        v-for="item in summaryCards"
        :key="item.label"
        class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div class="text-sm text-slate-500">{{ item.label }}</div>
        <div class="mt-3 text-3xl font-semibold text-slate-950">{{ item.value }}</div>
        <div class="mt-2 text-xs text-slate-500">{{ item.hint }}</div>
      </div>
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <el-card shadow="never">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">题目要求对齐</span>
            <el-tag type="success">第一阶段已落位</el-tag>
          </div>
        </template>
        <div class="space-y-4">
          <div
            v-for="module in modules"
            :key="module.title"
            class="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <div class="flex items-center justify-between gap-4">
              <div class="font-medium text-slate-900">{{ module.title }}</div>
              <el-tag size="small">{{ module.status }}</el-tag>
            </div>
            <div class="mt-2 text-sm leading-6 text-slate-600">
              {{ module.description }}
            </div>
          </div>
        </div>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <span class="font-medium">下一步实施重点</span>
        </template>
        <div class="space-y-3">
          <div
            v-for="step in nextSteps"
            :key="step.title"
            class="rounded-lg border border-slate-200 p-4"
          >
            <div class="text-sm font-medium text-slate-900">{{ step.title }}</div>
            <div class="mt-2 text-sm text-slate-600">{{ step.detail }}</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
const summaryCards = [
  { label: '2D 大屏项目', value: '3', hint: '覆盖新建、编辑、预览、发布、克隆入口' },
  { label: '3D 场景项目', value: '3', hint: '覆盖模型导入、场景编辑、预览和发布入口' },
  { label: '数据资产', value: '6', hint: '数据源和数据集统一管理骨架已建立' },
  { label: '管理模块', value: '3', hint: '用户、项目、系统管理已进入同一信息架构' },
]

const modules = [
  {
    title: '大屏可视化',
    status: '已落位',
    description: '已建立项目列表和 2D 编辑器原型，覆盖项目管理和低代码工作台入口。',
  },
  {
    title: '三维可视化',
    status: '已落位',
    description: '已建立三维场景列表和 3D 编辑器原型，预留模型导入与场景树区域。',
  },
  {
    title: '数据管理',
    status: '已落位',
    description: '已建立数据源和数据集双页面，具备类型、状态、连接和字段信息展示。',
  },
  {
    title: '用户与项目管理',
    status: '已落位',
    description: '已建立用户管理、项目管理和系统设置页面，后续可接 RBAC 和鉴权。',
  },
]

const nextSteps = [
  {
    title: '2D 编辑器拖拽化',
    detail: '接入组件实例状态管理和真实拖拽定位，补齐画布保存、预览和发布。',
  },
  {
    title: 'MySQL 数据源接入',
    detail: '新增数据源表单、连接测试和数据集建模流程，形成数据接入闭环。',
  },
  {
    title: 'RBAC 权限实现',
    detail: '补角色、菜单、项目权限矩阵，并在路由层增加权限守卫。',
  },
]
</script>
