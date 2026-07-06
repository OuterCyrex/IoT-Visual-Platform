<template>
  <div class="space-y-6">
    <el-card shadow="never">
      <div class="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <el-input v-model="keyword" placeholder="搜索大屏名称 / 负责人" />
        <el-select v-model="status" placeholder="大屏状态">
          <el-option label="全部状态" value="all" />
          <el-option label="草稿" value="draft" />
          <el-option label="编辑中" value="editing" />
          <el-option label="已发布" value="published" />
        </el-select>
        <el-select v-model="group" placeholder="大屏分组">
          <el-option label="全部分组" value="all" />
          <el-option
            v-for="item in groups"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
        <div class="flex justify-end gap-3">
          <el-button @click="reset">重置</el-button>
          <el-button type="primary">新建大屏</el-button>
        </div>
      </div>
    </el-card>

    <el-table :data="filteredProjects" border>
      <el-table-column prop="name" label="大屏名称" min-width="220" />
      <el-table-column prop="group" label="分组" min-width="120" />
      <el-table-column prop="owner" label="负责人" min-width="100" />
      <el-table-column prop="modelCount" label="素材数" min-width="90" />
      <el-table-column prop="engine" label="渲染引擎" min-width="110" />
      <el-table-column prop="updatedAt" label="最近更新" min-width="160" />
      <el-table-column label="状态" min-width="100">
        <template #default="{ row }">
          <el-tag :type="getTagType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="240" fixed="right">
        <template #default="{ row }">
          <div class="flex gap-2">
            <el-button size="small" type="primary" @click="openEditor(row.id)">编辑</el-button>
            <el-button size="small">预览</el-button>
            <el-button size="small">发布</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { sceneProjects as projects } from '../../mock/platform'
import type { ProjectStatus } from '../../types/platform'

const router = useRouter()
const keyword = ref('')
const status = ref<'all' | ProjectStatus>('all')
const group = ref<'all' | string>('all')

const groups = [...new Set(projects.map((item) => item.group))]

const statusLabelMap: Record<ProjectStatus, string> = {
  draft: '草稿',
  editing: '编辑中',
  published: '已发布',
  archived: '已归档',
}

const tagTypeMap: Record<ProjectStatus, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
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

const filteredProjects = computed(() => {
  return projects.filter((item) => {
    const matchesKeyword =
      !keyword.value ||
      item.name.includes(keyword.value) ||
      item.owner.includes(keyword.value)
    const matchesStatus = status.value === 'all' || item.status === status.value
    const matchesGroup = group.value === 'all' || item.group === group.value
    return matchesKeyword && matchesStatus && matchesGroup
  })
})

function reset() {
  keyword.value = ''
  status.value = 'all'
  group.value = 'all'
}

function openEditor(id: string) {
  router.push({ name: 'screen-editor', params: { id } })
}
</script>
