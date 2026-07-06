<template>
  <div class="space-y-6">
    <el-card shadow="never">
      <div class="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <el-input placeholder="搜索数据源名称 / 地址 / 负责人" />
        <el-select placeholder="数据源类型">
          <el-option label="全部类型" value="all" />
          <el-option label="MySQL" value="mysql" />
          <el-option label="MQTT" value="mqtt" />
          <el-option label="REST" value="rest" />
        </el-select>
        <el-select placeholder="连接状态">
          <el-option label="全部状态" value="all" />
          <el-option label="已连接" value="connected" />
          <el-option label="告警" value="warning" />
          <el-option label="失败" value="failed" />
        </el-select>
        <div class="flex justify-end gap-3">
          <el-button>重置</el-button>
          <el-button type="primary">新增数据源</el-button>
        </div>
      </div>
    </el-card>

    <el-table :data="sources" border>
      <el-table-column prop="name" label="数据源名称" min-width="180" />
      <el-table-column prop="type" label="类型" min-width="100" />
      <el-table-column prop="host" label="连接地址" min-width="220" />
      <el-table-column prop="database" label="数据库 / Topic / Path" min-width="180" />
      <el-table-column prop="owner" label="负责人" min-width="100" />
      <el-table-column prop="updatedAt" label="最近更新" min-width="160" />
      <el-table-column label="状态" min-width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTag(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="280" fixed="right">
        <template #default>
          <div class="flex gap-2">
            <el-button size="small" type="primary">测试连接</el-button>
            <el-button size="small">编辑</el-button>
            <el-button size="small">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { dataSources as sources } from '../../mock/platform'
import type { DataSource } from '../../types/platform'

type StatusKey = DataSource['status']

const statusLabelMap: Record<StatusKey, string> = {
  connected: '已连接',
  warning: '告警',
  failed: '失败',
}

const statusTagMap: Record<StatusKey, 'success' | 'warning' | 'danger'> = {
  connected: 'success',
  warning: 'warning',
  failed: 'danger',
}

function getStatusLabel(status: StatusKey) {
  return statusLabelMap[status]
}

function getStatusTag(status: StatusKey) {
  return statusTagMap[status]
}
</script>
