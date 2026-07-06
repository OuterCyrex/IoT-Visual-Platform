<template>
  <div class="grid gap-6 xl:grid-cols-[280px_1fr_320px]">
    <el-card shadow="never">
      <template #header>
        <span class="font-medium">组件库</span>
      </template>
      <div class="grid gap-3">
        <div
          v-for="component in components"
          :key="component.name"
          class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <div class="text-sm font-medium text-slate-900">{{ component.name }}</div>
          <div class="mt-1 text-xs text-slate-500">{{ component.desc }}</div>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" body-class="p-4">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-medium">2D 画布工作台</span>
          <div class="flex gap-2">
            <el-button size="small">预览</el-button>
            <el-button size="small" type="primary">发布</el-button>
          </div>
        </div>
      </template>

      <div class="rounded-lg border border-dashed border-slate-300 bg-slate-950 p-6">
        <div class="mx-auto grid aspect-[16/9] w-full max-w-5xl grid-cols-12 gap-4 rounded-lg bg-[#081225] p-5">
          <div class="col-span-12 rounded-md border border-cyan-500/40 bg-cyan-500/10 p-4 text-cyan-100">
            顶部标题栏 / 时间 / 状态指示
          </div>
          <div class="col-span-7 rounded-md border border-slate-700 bg-slate-900/70 p-4 text-slate-200">
            主图表区域
          </div>
          <div class="col-span-5 rounded-md border border-slate-700 bg-slate-900/70 p-4 text-slate-200">
            KPI / 设备状态
          </div>
          <div class="col-span-4 rounded-md border border-slate-700 bg-slate-900/70 p-4 text-slate-200">
            趋势图
          </div>
          <div class="col-span-4 rounded-md border border-slate-700 bg-slate-900/70 p-4 text-slate-200">
            告警列表
          </div>
          <div class="col-span-4 rounded-md border border-slate-700 bg-slate-900/70 p-4 text-slate-200">
            地图 / 区域态势
          </div>
        </div>
      </div>
    </el-card>

    <div class="space-y-6">
      <el-card shadow="never">
        <template #header>
          <span class="font-medium">图层列表</span>
        </template>
        <div class="space-y-3">
          <div
            v-for="layer in layers"
            :key="layer.name"
            class="rounded-lg border border-slate-200 px-4 py-3"
          >
            <div class="text-sm font-medium text-slate-900">{{ layer.name }}</div>
            <div class="mt-1 text-xs text-slate-500">{{ layer.type }}</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <span class="font-medium">属性面板</span>
        </template>
        <el-form label-position="top">
          <el-form-item label="组件名称">
            <el-input model-value="产线总览图表" />
          </el-form-item>
          <el-form-item label="绑定数据集">
            <el-select model-value="车间实时能耗">
              <el-option label="车间实时能耗" value="车间实时能耗" />
              <el-option label="设备告警流" value="设备告警流" />
            </el-select>
          </el-form-item>
          <el-form-item label="自动刷新">
            <el-switch :model-value="true" />
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
const components = [
  { name: '指标卡', desc: '用于展示设备数量、产量、告警等关键指标。' },
  { name: '折线图', desc: '用于展示实时趋势与历史曲线。' },
  { name: '表格', desc: '用于展示设备列表、告警记录与统计明细。' },
  { name: '地图', desc: '用于展示园区、产线和区域态势分布。' },
]

const layers = [
  { name: '顶部标题', type: 'Text' },
  { name: '产线总览图表', type: 'Chart' },
  { name: '告警列表', type: 'Table' },
  { name: '园区态势', type: 'Map' },
]
</script>
