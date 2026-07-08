<template>
  <div class="space-y-6">
    <el-card shadow="never">
      <div class="space-y-4">
        <div>
          <h2 class="text-lg font-semibold text-slate-900">项目管理</h2>
        </div>

        <div class="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <el-input v-model="keyword" placeholder="搜索项目名称 / 分组 / 负责人" clearable />
          <el-select v-model="scopeType" placeholder="项目类型">
            <el-option label="全部类型" value="all" />
            <el-option label="2D" value="screen" />
            <el-option label="3D" value="scene" />
          </el-select>
          <el-select v-model="groupFilter" placeholder="项目分组" clearable>
            <el-option label="全部分组" value="all" />
            <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
          </el-select>
          <el-select v-model="statusFilter" placeholder="项目状态">
            <el-option label="全部状态" value="all" />
            <el-option label="草稿" value="draft" />
            <el-option label="编辑中" value="editing" />
            <el-option label="已发布" value="published" />
            <el-option label="已归档" value="archived" />
          </el-select>
          <div class="flex justify-end gap-3">
            <el-button @click="resetQuery">重置</el-button>
            <el-button type="primary" @click="openGroupDialog">新建项目分组</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <div class="p-4 bg-white"> 
    <el-table v-loading="loading" :data="filteredProjects" border>
        <el-table-column prop="name" label="项目名称" min-width="220" />
        <el-table-column prop="kindLabel" label="类型" min-width="90" />
        <el-table-column prop="group" label="项目分组" min-width="140" />
        <el-table-column prop="owner" label="负责人" min-width="120" />
        <el-table-column prop="updatedAt" label="最近更新" min-width="160" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getTagType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <el-button size="small" type="primary" @click="openEditDialog(row)">编辑基础信息</el-button>
              <el-button size="small" type="danger" plain @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table></div>



    <el-dialog v-model="groupDialogVisible" title="新建项目分组" width="420px" destroy-on-close>
      <el-form ref="groupFormRef" :model="groupForm" :rules="groupRules" label-position="top">
        <el-form-item label="分组名称" prop="name">
          <el-input v-model="groupForm.name" placeholder="请输入分组名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="groupDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="groupSubmitting" @click="saveGroup">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogVisible" title="编辑项目基础信息" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目类型">
          <el-input :model-value="form.kindLabel" disabled />
        </el-form-item>
        <el-form-item label="项目分组" prop="group">
          <el-select v-model="form.group" placeholder="请选择或输入分组" filterable allow-create default-first-option
            class="w-full">
            <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="owner">
          <el-input v-model="form.owner" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" class="w-full">
            <el-option label="草稿" value="draft" />
            <el-option label="编辑中" value="editing" />
            <el-option label="已发布" value="published" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import request from '../../utils/request'
import type { ProjectStatus, ScreenProject, SceneProject } from '../../types/platform'

type ProjectKind = 'screen' | 'scene'

type UnifiedProject = {
  id: string
  kind: ProjectKind
  kindLabel: '2D' | '3D'
  name: string
  group: string
  owner: string
  status: ProjectStatus
  updatedAt: string
}

const loading = ref(false)
const submitting = ref(false)
const groupSubmitting = ref(false)
const screenProjects = ref<ScreenProject[]>([])
const sceneProjects = ref<SceneProject[]>([])
const keyword = ref('')
const scopeType = ref<'all' | ProjectKind>('all')
const groupFilter = ref<'all' | string>('all')
const statusFilter = ref<'all' | ProjectStatus>('all')
const groupDialogVisible = ref(false)
const dialogVisible = ref(false)
const editTarget = ref<UnifiedProject | null>(null)
const formRef = ref<FormInstance>()
const groupFormRef = ref<FormInstance>()
const groupForm = ref({ name: '' })
const createdGroups = ref<string[]>([])
const form = ref<UnifiedProject>({
  id: '',
  kind: 'screen',
  kindLabel: '2D',
  name: '',
  group: '',
  owner: '',
  status: 'draft',
  updatedAt: '',
})

const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  group: [{ required: true, message: '请选择项目分组', trigger: 'change' }],
  owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  status: [{ required: true, message: '请选择项目状态', trigger: 'change' }],
}

const groupRules = {
  name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
}

const statusLabelMap: Record<ProjectStatus, string> = {
  draft: '草稿',
  editing: '编辑中',
  published: '已发布',
  archived: '已归档',
}

const tagTypeMap: Record<ProjectStatus, 'info' | 'warning' | 'success' | 'danger'> = {
  draft: 'info',
  editing: 'warning',
  published: 'success',
  archived: 'danger',
}

const unifiedProjects = computed<UnifiedProject[]>(() => [
  ...screenProjects.value.map((item): UnifiedProject => ({
    id: item.id,
    kind: 'screen',
    kindLabel: '2D',
    name: item.name,
    group: item.group,
    owner: item.owner,
    status: item.status,
    updatedAt: item.updatedAt,
  })),
  ...sceneProjects.value.map((item): UnifiedProject => ({
    id: item.id,
    kind: 'scene',
    kindLabel: '3D',
    name: item.name,
    group: item.group,
    owner: item.owner,
    status: item.status,
    updatedAt: item.updatedAt,
  })),
])

const groupOptions = computed(() => {
  const groups = new Set<string>(createdGroups.value)
  for (const item of unifiedProjects.value) {
    if (item.group) {
      groups.add(item.group)
    }
  }
  return [...groups]
})

const filteredProjects = computed(() => {
  return unifiedProjects.value.filter((item) => {
    const matchesKeyword =
      !keyword.value ||
      item.name.toLowerCase().includes(keyword.value.toLowerCase()) ||
      item.group.toLowerCase().includes(keyword.value.toLowerCase()) ||
      item.owner.toLowerCase().includes(keyword.value.toLowerCase())
    const matchesType = scopeType.value === 'all' || item.kind === scopeType.value
    const matchesGroup = groupFilter.value === 'all' || item.group === groupFilter.value
    const matchesStatus = statusFilter.value === 'all' || item.status === statusFilter.value
    return matchesKeyword && matchesType && matchesGroup && matchesStatus
  })
})

function getStatusLabel(status: ProjectStatus) {
  return statusLabelMap[status]
}

function getTagType(status: ProjectStatus) {
  return tagTypeMap[status]
}

async function fetchProjects() {
  loading.value = true
  try {
    const [screenRes, sceneRes] = await Promise.all([
      request.get('/api/screenProjects'),
      request.get('/api/sceneProjects'),
    ]) as [any, any]
    screenProjects.value = screenRes.items || []
    sceneProjects.value = sceneRes.items || []
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  keyword.value = ''
  scopeType.value = 'all'
  groupFilter.value = 'all'
  statusFilter.value = 'all'
}

function openGroupDialog() {
  groupForm.value = { name: '' }
  groupDialogVisible.value = true
}

async function saveGroup() {
  if (!groupFormRef.value) return
  await groupFormRef.value.validate(async (valid) => {
    if (!valid) return
    const name = groupForm.value.name.trim()
    if (!createdGroups.value.includes(name)) {
      createdGroups.value = [...createdGroups.value, name]
    }
    groupDialogVisible.value = false
    ElMessage.success('分组已创建')
  })
}

function openEditDialog(row: UnifiedProject) {
  editTarget.value = row
  form.value = { ...row }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value || !editTarget.value) return
  const target = editTarget.value
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload = {
        name: form.value.name,
        group: form.value.group,
        owner: form.value.owner,
        status: form.value.status,
      }
      if (target.kind === 'screen') {
        await request.put(`/api/screenProjects/${target.id}`, payload)
      } else {
        await request.put(`/api/sceneProjects/${target.id}`, payload)
      }
      ElMessage.success('更新成功')
      dialogVisible.value = false
      await fetchProjects()
    } finally {
      submitting.value = false
    }
  })
}

async function handleDelete(row: UnifiedProject) {
  await ElMessageBox.confirm(`确定删除项目“${row.name}”吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  if (row.kind === 'screen') {
    await request.delete(`/api/screenProjects/${row.id}`)
  } else {
    await request.delete(`/api/sceneProjects/${row.id}`)
  }
  ElMessage.success('删除成功')
  await fetchProjects()
}

onMounted(() => {
  fetchProjects()
})
</script>
