<template>
  <div class="space-y-6">
    <el-card shadow="never">
      <div class="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <el-input v-model="keyword" placeholder="搜索大屏名称 / 负责人" clearable />
        <el-select v-model="status" placeholder="大屏状态">
          <el-option label="全部状态" value="all" />
          <el-option label="草稿" value="draft" />
          <el-option label="编辑中" value="editing" />
          <el-option label="已发布" value="published" />
          <el-option label="已归档" value="archived" />
        </el-select>
        <el-select v-model="group" placeholder="大屏分组">
          <el-option label="全部分组" value="all" />
          <el-option v-for="item in groups" :key="item" :label="item" :value="item" />
        </el-select>
        <div class="flex justify-end gap-3">
          <el-button @click="reset">重置</el-button>
          <el-button type="primary" @click="openCreateDialog">新建大屏</el-button>
        </div>
      </div>
    </el-card>

    <div class="p-4 bg-white">
      <el-table v-loading="loading" :data="filteredProjects" border>
        <el-table-column prop="name" label="大屏名称" min-width="220" />
        <el-table-column prop="group" label="分组" min-width="120" />
        <el-table-column prop="scene" label="关联三维场景" min-width="130" />
        <el-table-column prop="owner" label="负责人" min-width="100" />
        <el-table-column prop="publishedVersion" label="发布版本" min-width="100" />
        <el-table-column prop="updatedAt" label="最近更新" min-width="160" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getTagType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="320" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <el-button size="small" type="success" plain @click="openPreview(row.id)">预览</el-button>
              <el-button size="small" type="primary" @click="openEditor(row.id)">编辑</el-button>
              <el-button size="small" @click="handleClone(row)">克隆</el-button>
              <el-button size="small" @click="handlePublish(row)">发布</el-button>
              <el-button size="small" type="danger" plain @click="handleDelete(row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="createDialogVisible" title="新建大屏" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="大屏名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入大屏名称" />
        </el-form-item>
        <el-form-item label="项目分组" prop="group">
          <el-input v-model="form.group" placeholder="例如：运营中心、设备看板" />
        </el-form-item>
        <el-form-item label="关联三维场景" prop="scene">
          <el-select v-model="form.scene" placeholder="请选择三维场景" class="w-full" filterable>
            <el-option
              v-for="item in sceneOptions"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="owner">
          <el-input v-model="form.owner" placeholder="请输入负责人姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitCreate">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import request from '../../utils/request'
import type { ProjectStatus, SceneProject, ScreenProject } from '../../types/platform'

const router = useRouter()
const projects = ref<ScreenProject[]>([])
const sceneOptions = ref<SceneProject[]>([])
const loading = ref(false)
const submitting = ref(false)

const keyword = ref('')
const status = ref<'all' | ProjectStatus>('all')
const group = ref<'all' | string>('all')

const createDialogVisible = ref(false)
const formRef = ref<FormInstance>()
const form = ref({
  name: '',
  group: '',
  scene: '',
  owner: 'Admin',
})

const rules = {
  name: [{ required: true, message: '请输入大屏名称', trigger: 'blur' }],
  group: [{ required: true, message: '请输入项目分组', trigger: 'blur' }],
  scene: [{ required: true, message: '请选择三维场景', trigger: 'change' }],
  owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
}

const groups = computed(() => [...new Set(projects.value.map((item) => item.group).filter(Boolean))])

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

function getStatusLabel(value: ProjectStatus) {
  return statusLabelMap[value] || value
}

function getTagType(value: ProjectStatus) {
  return tagTypeMap[value] || 'info'
}

async function fetchProjects() {
  loading.value = true
  try {
    const res: any = await request.get('/api/screenProjects')
    projects.value = res.items || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function fetchSceneOptions() {
  try {
    const res: any = await request.get('/api/sceneProjects')
    sceneOptions.value = res.items || []
  } catch (err) {
    console.error(err)
  }
}

function openCreateDialog() {
  const userStr = localStorage.getItem('auth_user')
  const user = userStr ? JSON.parse(userStr) : null
  form.value = {
    name: '',
    group: '',
    scene: '',
    owner: user?.displayName || 'Admin',
  }
  createDialogVisible.value = true
}

async function submitCreate() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await request.post('/api/screenProjects', {
        name: form.value.name,
        group: form.value.group,
        scene: form.value.scene,
        owner: form.value.owner,
        status: 'draft',
        publishedVersion: '未发布',
        tags: [],
        screenNodes: [],
      })
      ElMessage.success('创建成功')
      createDialogVisible.value = false
      await fetchProjects()
    } catch (err) {
      console.error(err)
    } finally {
      submitting.value = false
    }
  })
}

async function handleClone(row: ScreenProject) {
  try {
    await request.post(`/api/screenProjects/${row.id}/clone`)
    ElMessage.success('克隆成功')
    await fetchProjects()
  } catch (err) {
    console.error(err)
  }
}

async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除该大屏项目吗？此操作不可恢复！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await request.delete(`/api/screenProjects/${id}`)
    ElMessage.success('删除成功')
    await fetchProjects()
  } catch (err) {
    if (err !== 'cancel' && err !== 'close') {
      console.error(err)
    }
  }
}

async function handlePublish(row: ScreenProject) {
  const currentVer = row.publishedVersion || '未发布'
  ElMessageBox.prompt(`请输入发布版本号，留空则系统自动递增。当前版本：${currentVer}`, '发布大屏', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '例如：1.0.0 或 1.0.2',
  })
    .then(async ({ value }) => {
      try {
        await request.post(`/api/screenProjects/${row.id}/publish`, {
          version: value ? value.trim() : undefined,
        })
        ElMessage.success('发布成功')
        await fetchProjects()
      } catch (err) {
        console.error(err)
      }
    })
    .catch(() => {})
}

const filteredProjects = computed(() => {
  return projects.value.filter((item) => {
    const matchesKeyword =
      !keyword.value ||
      item.name.toLowerCase().includes(keyword.value.toLowerCase()) ||
      item.owner.toLowerCase().includes(keyword.value.toLowerCase())
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

function openPreview(id: string) {
  router.push(`/screens/${id}/preview`)
}

onMounted(() => {
  fetchProjects()
  fetchSceneOptions()
})
</script>
