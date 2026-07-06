<template>
  <div class="grid gap-6 xl:grid-cols-[300px_1fr_320px]">
    <el-card shadow="never">
      <template #header>
        <span class="font-medium">模型资源</span>
      </template>
      <div class="space-y-3">
        <div
          v-for="asset in assets"
          :key="asset.name"
          class="rounded-lg border border-slate-200 bg-slate-50 p-4"
        >
          <div class="text-sm font-medium text-slate-900">{{ asset.name }}</div>
          <div class="mt-1 text-xs text-slate-500">{{ asset.type }}</div>
        </div>
      </div>
      <el-button class="mt-4 w-full" type="primary">导入 3D 模型</el-button>
    </el-card>

    <el-card shadow="never" body-class="p-4">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-medium">3D 视口工作台</span>
          <div class="flex gap-2">
            <el-button size="small">预览</el-button>
            <el-button size="small" type="primary">发布场景</el-button>
          </div>
        </div>
      </template>

      <div class="rounded-lg border border-dashed border-slate-300 bg-slate-950 p-6">
        <div class="mx-auto aspect-[16/9] w-full max-w-5xl rounded-lg bg-[radial-gradient(circle_at_top,#15325d,#040b18)] p-6">
          <div class="grid h-full grid-cols-[1.2fr_0.8fr] gap-4">
            <div class="rounded-lg border border-cyan-500/30 bg-slate-950/40 p-4 text-slate-100">
              三维场景视口
              <div class="mt-4 grid h-[calc(100%-2rem)] place-items-center rounded-md border border-slate-700 text-sm text-slate-400">
                预留 Three.js / 模型渲染区域
              </div>
            </div>
            <div class="grid gap-4">
              <div class="rounded-lg border border-slate-700 bg-slate-950/50 p-4 text-slate-100">
                场景状态 / 视角控制
              </div>
              <div class="rounded-lg border border-slate-700 bg-slate-950/50 p-4 text-slate-100">
                设备点位 / 数据绑定
              </div>
              <div class="rounded-lg border border-slate-700 bg-slate-950/50 p-4 text-slate-100">
                动画 / 巡检路线
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <div class="space-y-6">
      <el-card shadow="never">
        <template #header>
          <span class="font-medium">场景树</span>
        </template>
        <div class="space-y-3">
          <div
            v-for="node in sceneNodes"
            :key="node"
            class="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700"
          >
            {{ node }}
          </div>
        </div>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <span class="font-medium">属性配置</span>
        </template>
        <el-form label-position="top">
          <el-form-item label="对象名称">
            <el-input model-value="空压机 A01" />
          </el-form-item>
          <el-form-item label="绑定测点">
            <el-select model-value="pressure_a01">
              <el-option label="pressure_a01" value="pressure_a01" />
              <el-option label="temperature_a01" value="temperature_a01" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态动画">
            <el-switch :model-value="true" />
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
const assets = [
  { name: 'factory-main.glb', type: '建筑主体模型' },
  { name: 'pump-room.fbx', type: '设备机房模型' },
  { name: 'conveyor.glb', type: '产线设备模型' },
]

const sceneNodes = ['厂区总场景', '生产车间', '泵站设备', '仓储 AGV', '巡检路线']
</script>
