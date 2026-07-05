<template>
  <div class="grid gap-6 md:grid-cols-3">
    <el-card class="md:col-span-2 shadow-sm">
      <template #header>
        <div class="font-medium">概览</div>
      </template>
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="rounded-xl bg-slate-50 p-4">
          <div class="text-sm text-slate-500">设备数</div>
          <div class="mt-2 text-2xl font-semibold">128</div>
        </div>
        <div class="rounded-xl bg-slate-50 p-4">
          <div class="text-sm text-slate-500">在线数</div>
          <div class="mt-2 text-2xl font-semibold">96</div>
        </div>
        <div class="rounded-xl bg-slate-50 p-4">
          <div class="text-sm text-slate-500">告警数</div>
          <div class="mt-2 text-2xl font-semibold">7</div>
        </div>
      </div>
    </el-card>

    <el-card class="shadow-sm">
      <template #header>
        <div class="font-medium">快捷操作</div>
      </template>
      <div class="flex flex-col gap-3">
        <el-button>设备管理</el-button>
        <el-button>数据看板</el-button>
        <el-button>消息中心</el-button>
      </div>
    </el-card>

    <el-card class="md:col-span-3 shadow-sm">
      <template #header>
        <div class="font-medium">最近动态</div>
      </template>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="status" label="状态" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
const tableData = [
  { name: '温湿度传感器 A1', type: '传感器', status: '在线' },
  { name: '门禁控制器 B2', type: '控制器', status: '离线' },
  { name: '能耗采集器 C3', type: '采集器', status: '在线' },
]
</script>
