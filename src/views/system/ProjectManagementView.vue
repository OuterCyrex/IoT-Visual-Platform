<template>
  <div class="space-y-6">
    <el-card shadow="never">
      <div class="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <el-input placeholder="搜索项目名称 / 分组 / 负责人" />
        <el-select placeholder="项目类型">
          <el-option label="全部类型" value="all" />
          <el-option label="2D" value="2d" />
          <el-option label="3D" value="3d" />
        </el-select>
        <el-select placeholder="项目状态">
          <el-option label="全部状态" value="all" />
          <el-option label="草稿" value="draft" />
          <el-option label="编辑中" value="editing" />
          <el-option label="已发布" value="published" />
        </el-select>
        <div class="flex justify-end gap-3">
          <el-button>新建分组</el-button>
          <el-button type="primary">新增项目</el-button>
        </div>
      </div>
    </el-card>

    <el-table :data="projects" border>
      <el-table-column prop="name" label="项目名称" min-width="200" />
      <el-table-column prop="type" label="类型" min-width="90" />
      <el-table-column prop="group" label="项目分组" min-width="120" />
      <el-table-column prop="owner" label="负责人" min-width="100" />
      <el-table-column prop="updatedAt" label="最近更新" min-width="160" />
      <el-table-column label="状态" min-width="100">
        <template #default="{ row }">
          <el-tag :type="getTagType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="240" fixed="right">
        <template #default>
          <div class="flex gap-2">
            <el-button size="small" type="primary">编辑</el-button>
            <el-button size="small">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { managedProjects as projects } from '../../mock/platform'
import type { ManagedProject } from '../../types/platform'

type ProjectStatus = ManagedProject['status']

const statusLabelMap: Record<ProjectStatus, string> = {
  draft: '草稿',
  editing: '编辑中',
  published: '已发布',
  archived: '已归档',
}

const tagTypeMap: Record<ProjectStatus, 'info' | 'warning' | 'success' | 'info'> = {
  draft: 'info',
  editing: 'warning',
  published: 'success',
  archived: 'info',
}

function getStatusLabel(status: ProjectStatus) {
  return statusLabelMap[status]
}

function getTagType(status: ProjectStatus) {
  return tagTypeMap[status]
}
</script>
