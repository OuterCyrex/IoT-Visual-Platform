<template>
  <div class="space-y-6">
    <el-card shadow="never">
      <div class="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <el-input v-model="keyword" placeholder="搜索项目名称 / 分组 / 负责人" clearable />
        <el-select v-model="type" placeholder="项目类型">
          <el-option label="全部类型" value="all" />
          <el-option label="2D" value="2D" />
          <el-option label="3D" value="3D" />
        </el-select>
        <el-select v-model="status" placeholder="项目状态">
          <el-option label="全部状态" value="all" />
          <el-option label="草稿" value="draft" />
          <el-option label="编辑中" value="editing" />
          <el-option label="已发布" value="published" />
        </el-select>
        <div class="flex justify-end gap-3">
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="primary" @click="openCreateDialog">新增项目</el-button>
        </div>
      </div>
    </el-card>

    <el-table v-loading="loading" :data="filteredProjects" border>
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
        <template #default="{ row }">
          <div class="flex gap-2">
            <el-button size="small" type="primary" @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(row.id)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- Create/Edit Project Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑项目' : '新增项目'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择项目类型" :disabled="isEdit" class="w-full">
            <el-option label="2D 大屏" value="2D" />
            <el-option label="3D 场景" value="3D" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目分组" prop="group">
          <el-input v-model="form.group" placeholder="请输入项目分组，如：能源中心" />
        </el-form-item>
        <el-form-item label="负责人" prop="owner">
          <el-input v-model="form.owner" placeholder="请输入项目负责人" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" class="w-full">
            <el-option label="草稿" value="draft" />
            <el-option label="编辑中" value="editing" />
            <el-option label="已发布" value="published" />
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
import { computed, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import request from '../../utils/request'
import type { ManagedProject, ProjectStatus } from '../../types/platform'

const projects = ref<ManagedProject[]>([])
const loading = ref(false)
const submitting = ref(false)

const keyword = ref('')
const type = ref<'all' | '2D' | '3D'>('all')
const status = ref<'all' | ProjectStatus>('all')

const dialogVisible = ref(false)
const isEdit = ref(false)
const editProjectId = ref('')
const formRef = ref<FormInstance>()

const form = ref({
  name: '',
  type: '2D' as '2D' | '3D',
  group: '',
  owner: '',
  status: 'draft' as ProjectStatus,
})

const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
  group: [{ required: true, message: '请输入项目分组', trigger: 'blur' }],
  owner: [{ required: true, message: '请输入项目负责人', trigger: 'blur' }],
  status: [{ required: true, message: '请选择项目状态', trigger: 'change' }],
}

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

function getStatusLabel(s: ProjectStatus) {
  return statusLabelMap[s] || s
}

function getTagType(s: ProjectStatus) {
  return tagTypeMap[s] || 'info'
}

async function fetchProjects() {
  loading.value = true
  try {
    const res: any = await request.get('/api/projects')
    projects.value = res.items || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const filteredProjects = computed(() => {
  return projects.value.filter((item) => {
    const matchesKeyword =
      !keyword.value ||
      item.name.toLowerCase().includes(keyword.value.toLowerCase()) ||
      item.group.toLowerCase().includes(keyword.value.toLowerCase()) ||
      item.owner.toLowerCase().includes(keyword.value.toLowerCase())
    const matchesType = type.value === 'all' || item.type === type.value
    const matchesStatus = status.value === 'all' || item.status === status.value
    return matchesKeyword && matchesType && matchesStatus
  })
})

function resetQuery() {
  keyword.value = ''
  type.value = 'all'
  status.value = 'all'
}

function openCreateDialog() {
  isEdit.value = false
  editProjectId.value = ''
  const userStr = localStorage.getItem('auth_user')
  const user = userStr ? JSON.parse(userStr) : null
  const owner = user?.displayName || 'Admin'
  form.value = {
    name: '',
    type: '2D',
    group: '默认分组',
    owner: owner,
    status: 'draft',
  }
  dialogVisible.value = true
}

function openEditDialog(row: ManagedProject) {
  isEdit.value = true
  editProjectId.value = row.id
  form.value = {
    name: row.name,
    type: row.type,
    group: row.group,
    owner: row.owner,
    status: row.status,
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (isEdit.value) {
        await request.put(`/api/projects/${editProjectId.value}`, {
          name: form.value.name,
          group: form.value.group,
          owner: form.value.owner,
          status: form.value.status,
        })
        ElMessage.success('更新成功')
      } else {
        await request.post('/api/projects', form.value)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchProjects()
    } catch (err) {
      console.error(err)
    } finally {
      submitting.value = false
    }
  })
}

async function handleDelete(id: string) {
  ElMessageBox.confirm('确定要删除该项目吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await request.delete(`/api/projects/${id}`)
      ElMessage.success('删除成功')
      fetchProjects()
    } catch (err) {
      console.error(err)
    }
  })
}

onMounted(() => {
  fetchProjects()
})
</script>
