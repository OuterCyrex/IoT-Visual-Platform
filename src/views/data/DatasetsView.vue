<template>
  <div class="space-y-6">
    <el-card shadow="never">
      <div class="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <el-input placeholder="搜索数据集名称 / 表名 / 数据源" />
        <el-select placeholder="刷新策略">
          <el-option label="全部策略" value="all" />
          <el-option label="手动" value="manual" />
          <el-option label="5 分钟" value="5 min" />
          <el-option label="实时" value="real-time" />
        </el-select>
        <el-select placeholder="数据源">
          <el-option label="全部数据源" value="all" />
          <el-option
            v-for="source in sourceNames"
            :key="source"
            :label="source"
            :value="source"
          />
        </el-select>
        <div class="flex justify-end gap-3">
          <el-button>重置</el-button>
          <el-button type="primary">新建数据集</el-button>
        </div>
      </div>
    </el-card>

    <div class="grid gap-5 xl:grid-cols-3">
      <el-card
        v-for="dataset in datasets"
        :key="dataset.id"
        shadow="never"
        class="border border-slate-200"
      >
        <div class="text-base font-medium text-slate-900">{{ dataset.name }}</div>
        <div class="mt-3 space-y-2 text-sm text-slate-600">
          <div>来源数据源：{{ dataset.sourceName }}</div>
          <div>对象名称：{{ dataset.tableName }}</div>
          <div>字段数量：{{ dataset.fieldCount }}</div>
          <div>刷新策略：{{ refreshLabelMap[dataset.refreshMode] }}</div>
          <div>最近更新：{{ dataset.updatedAt }}</div>
        </div>
        <div class="mt-6 flex gap-2">
          <el-button size="small" type="primary">字段配置</el-button>
          <el-button size="small">预览数据</el-button>
          <el-button size="small">删除</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { datasets } from '../../mock/platform'

const sourceNames = [...new Set(datasets.map((item) => item.sourceName))]

const refreshLabelMap = {
  manual: '手动',
  '5 min': '5 分钟',
  'real-time': '实时',
}
</script>
