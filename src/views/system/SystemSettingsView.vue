<template>
  <div class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
    <el-card shadow="never">
      <template #header>
        <span class="font-medium">平台配置</span>
      </template>
      <el-form label-position="top">
        <div class="grid gap-4 md:grid-cols-2">
          <el-form-item label="平台名称">
            <el-input model-value="IoT Visual Platform" />
          </el-form-item>
          <el-form-item label="默认主题色">
            <el-color-picker model-value="#2563eb" />
          </el-form-item>
          <el-form-item label="默认数据源类型">
            <el-select model-value="MySQL">
              <el-option label="MySQL" value="MySQL" />
              <el-option label="MQTT" value="MQTT" />
              <el-option label="REST" value="REST" />
            </el-select>
          </el-form-item>
          <el-form-item label="自动刷新">
            <el-switch :model-value="true" />
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <span class="font-medium">RBAC 权限矩阵</span>
      </template>
      <div class="space-y-3">
        <div
          v-for="role in roles"
          :key="role.name"
          class="rounded-lg border border-slate-200 p-4"
        >
          <div class="text-sm font-medium text-slate-900">{{ role.name }}</div>
          <div class="mt-2 text-sm text-slate-600">{{ role.scope }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
const roles = [
  { name: 'Super Admin', scope: '拥有系统、用户、项目、数据源和发布权限。' },
  { name: 'Screen Designer', scope: '拥有 2D 大屏项目编辑、预览和发布权限。' },
  { name: 'Scene Editor', scope: '拥有 3D 场景编辑、模型导入和预览权限。' },
  { name: 'Data Operator', scope: '拥有数据源、数据集维护和连通性测试权限。' },
]
</script>
