<template>
  <div class="space-y-6">
    <el-card shadow="never">
      <div class="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <el-input placeholder="搜索大屏名称 / 场景 / 负责人" />
        <el-select placeholder="项目状态">
          <el-option label="全部状态" value="all" />
          <el-option label="草稿" value="draft" />
          <el-option label="编辑中" value="editing" />
          <el-option label="已发布" value="published" />
        </el-select>
        <el-select placeholder="项目分组">
          <el-option label="全部分组" value="all" />
          <el-option
            v-for="group in groups"
            :key="group"
            :label="group"
            :value="group"
          />
        </el-select>
        <div class="flex justify-end gap-3">
          <el-button>重置</el-button>
          <el-button type="primary">新建大屏</el-button>
        </div>
      </div>
    </el-card>

    <div class="grid gap-4 md:grid-cols-3">
      <div
        v-for="item in stats"
        :key="item.label"
        class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div class="text-sm text-slate-500">{{ item.label }}</div>
        <div class="mt-2 text-2xl font-semibold text-slate-950">{{ item.value }}</div>
      </div>
    </div>

    <div class="grid gap-5 xl:grid-cols-3">
      <el-card
        v-for="project in projects"
        :key="project.id"
        shadow="never"
        class="border border-slate-200"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-base font-medium text-slate-900">{{ project.name }}</div>
            <div class="mt-2 text-sm text-slate-500">{{ project.scene }}</div>
          </div>
          <el-tag :type="tagTypeMap[project.status]">{{ statusLabelMap[project.status] }}</el-tag>
        </div>

        <div class="mt-5 space-y-2 text-sm text-slate-600">
          <div>分组：{{ project.group }}</div>
          <div>负责人：{{ project.owner }}</div>
          <div>最近更新：{{ project.updatedAt }}</div>
          <div>发布版本：{{ project.publishedVersion }}</div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <el-tag
            v-for="tag in project.tags"
            :key="tag"
            size="small"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
        </div>

        <div class="mt-6 flex flex-wrap gap-2">
          <el-button size="small" type="primary">编辑</el-button>
          <el-button size="small">预览</el-button>
          <el-button size="small">发布</el-button>
          <el-button size="small">克隆</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { screenProjects as projects } from '../../mock/platform'

const groups = [...new Set(projects.map((item) => item.group))]

const stats = [
  { label: '大屏总数', value: projects.length },
  { label: '已发布', value: projects.filter((item) => item.status === 'published').length },
  { label: '编辑中', value: projects.filter((item) => item.status === 'editing').length },
]

const statusLabelMap = {
  draft: '草稿',
  editing: '编辑中',
  published: '已发布',
  archived: '已归档',
}

const tagTypeMap = {
  draft: 'info',
  editing: 'warning',
  published: 'success',
  archived: 'info',
} as const
</script>
