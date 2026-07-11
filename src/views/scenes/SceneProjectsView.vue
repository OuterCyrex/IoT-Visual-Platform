<template>
  <div class="space-y-6">
    <el-card shadow="never">
      <div class="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <el-input v-model="keyword" placeholder="搜索场景名称 / 渲染引擎 / 负责人" clearable />
        <el-select v-model="selectedStatus" placeholder="项目状态" clearable>
          <el-option label="全部状态" value="all" />
          <el-option label="草稿" value="draft" />
          <el-option label="编辑中" value="editing" />
          <el-option label="已发布" value="published" />
        </el-select>
        <el-select v-model="selectedGroup" placeholder="项目分组" clearable>
          <el-option label="全部分组" value="all" />
          <el-option v-for="group in groups" :key="group" :label="group" :value="group" />
        </el-select>
        <div class="flex justify-end gap-3">
          <el-button @click="resetFilters">重置</el-button>
          <el-button @click="openAssetLibrary">3D 组件库</el-button>
          <el-button type="primary" @click="openCreateDialog">新建 3D 场景</el-button>
        </div>
      </div>
    </el-card>

    <div class="bg-white p-4">
      <el-table v-loading="loading" :data="filteredProjects" border>
        <el-table-column prop="name" label="场景名称" min-width="220" />
        <el-table-column prop="group" label="分组" min-width="120" />
        <el-table-column prop="owner" label="负责人" min-width="100" />
        <el-table-column prop="modelCount" label="模型数" min-width="90" />
        <el-table-column prop="engine" label="渲染引擎" min-width="110" />
        <el-table-column prop="updatedAt" label="最近更新" min-width="160" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getTagType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="300" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <el-button size="small" type="primary" @click="handleEdit(row.id)">编辑</el-button>
              <el-button size="small" @click="handlePreview(row.id)">预览</el-button>
              <el-button size="small" type="success" plain :disabled="row.status === 'published'" @click="handlePublish(row)">发布</el-button>
              <el-button size="small" type="info" plain @click="handleExport(row.id)">导出 JSON</el-button>
              <el-button size="small" type="danger" plain @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="createDialogVisible" title="新建 3D 场景" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="场景名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入 3D 场景名称" />
        </el-form-item>
        <el-form-item label="项目分组" prop="group">
          <el-input v-model="form.group" placeholder="如：3D 工厂、设备中心" />
        </el-form-item>
        <el-form-item label="渲染引擎" prop="engine">
          <el-select v-model="form.engine" class="w-full">
            <el-option label="Three.js" value="Three.js" />
            <el-option label="Babylon.js" value="Babylon.js" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="owner">
          <el-input v-model="form.owner" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="从 JSON 初始化">
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            accept=".json,application/json"
            @change="handleImportTemplate"
          >
            <el-button plain>选择 JSON 文件</el-button>
          </el-upload>
          <div class="mt-2 text-xs text-slate-500">
            {{ importedTemplateName ? `已选择：${importedTemplateName}` : '可选：导入已导出的场景 JSON 作为初始内容' }}
          </div>
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
import type { FormInstance, UploadFile } from 'element-plus'
import request from '../../utils/request'
import type { SceneProject } from '../../types/platform'

type ProjectStatus = SceneProject['status']

const router = useRouter()
const loading = ref(false)
const projects = ref<SceneProject[]>([])

const keyword = ref('')
const selectedStatus = ref<'all' | ProjectStatus>('all')
const selectedGroup = ref<'all' | string>('all')

const createDialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const importedTemplateName = ref('')
const importedSceneJson = ref('')
const form = ref({
  name: '',
  group: '',
  engine: 'Three.js',
  owner: 'Admin',
})

const rules = {
  name: [{ required: true, message: '请输入 3D 场景名称', trigger: 'blur' }],
  group: [{ required: true, message: '请输入项目分组', trigger: 'blur' }],
  engine: [{ required: true, message: '请选择渲染引擎', trigger: 'change' }],
  owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
}

const groups = computed(() => [...new Set(projects.value.map((item) => item.group).filter(Boolean))])

const filteredProjects = computed(() => {
  return projects.value.filter((item) => {
    const matchesKeyword =
      !keyword.value ||
      item.name.toLowerCase().includes(keyword.value.toLowerCase()) ||
      item.engine.toLowerCase().includes(keyword.value.toLowerCase()) ||
      item.owner.toLowerCase().includes(keyword.value.toLowerCase())
    const matchesStatus = selectedStatus.value === 'all' || item.status === selectedStatus.value
    const matchesGroup = selectedGroup.value === 'all' || item.group === selectedGroup.value
    return matchesKeyword && matchesStatus && matchesGroup
  })
})

async function fetchProjects() {
  loading.value = true
  try {
    const res: any = await request.get('/api/sceneProjects')
    projects.value = res.items || []
  } catch (err) {
    console.error('获取 3D 场景失败:', err)
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  keyword.value = ''
  selectedStatus.value = 'all'
  selectedGroup.value = 'all'
}

function openAssetLibrary() {
  router.push('/scene-assets')
}

function openCreateDialog() {
  form.value = {
    name: '',
    group: '',
    engine: 'Three.js',
    owner: 'Admin',
  }
  importedTemplateName.value = ''
  importedSceneJson.value = ''
  createDialogVisible.value = true
}

async function handleImportTemplate(uploadFile: UploadFile) {
  const file = uploadFile.raw
  if (!file) return
  try {
    const text = await file.text()
    const parsed = JSON.parse(text)
    if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as any).sceneNodes)) {
      throw new Error('invalid_scene_json')
    }
    importedTemplateName.value = file.name
    importedSceneJson.value = text
    ElMessage.success(`已导入模板：${file.name}`)
  } catch (error) {
    importedTemplateName.value = ''
    importedSceneJson.value = ''
    ElMessage.error('JSON 模板无效，需包含 sceneNodes 数组')
    console.error(error)
  }
}

async function submitCreate() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await request.post('/api/sceneProjects', {
        name: form.value.name,
        group: form.value.group,
        engine: form.value.engine,
        owner: form.value.owner,
        status: 'draft',
        importedSceneJson: importedSceneJson.value || undefined,
      })
      ElMessage.success('3D 场景创建成功')
      createDialogVisible.value = false
      await fetchProjects()
    } catch (err) {
      console.error(err)
    } finally {
      submitting.value = false
    }
  })
}

function handleEdit(id: string) {
  router.push(`/scenes/${id}/editor`)
}

function handlePreview(id: string) {
  router.push(`/scenes/${id}/preview`)
}

async function handleExport(id: string) {
  try {
    const res: any = await request.get(`/api/sceneProjects/${id}/export`)
    if (res.fileUrl) {
      window.open(new URL(res.fileUrl, String(request.defaults.baseURL)).toString(), '_blank')
    }
  } catch (err) {
    console.error(err)
  }
}

async function handlePublish(row: SceneProject) {
  try {
    await ElMessageBox.confirm(`确定发布 3D 场景“${row.name}”吗？`, '发布确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await request.post(`/api/sceneProjects/${row.id}/publish`)
    ElMessage.success('场景发布成功')
    await fetchProjects()
  } catch (err) {
    if (err !== 'cancel' && err !== 'close') {
      console.error(err)
    }
  }
}

async function handleDelete(row: SceneProject) {
  try {
    await ElMessageBox.confirm(`确定删除 3D 场景“${row.name}”吗？`, '删除警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await request.delete(`/api/sceneProjects/${row.id}`)
    ElMessage.success('删除成功')
    await fetchProjects()
  } catch (err) {
    if (err !== 'cancel' && err !== 'close') {
      console.error(err)
    }
  }
}

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
  return statusLabelMap[status] || '未知'
}

function getTagType(status: ProjectStatus) {
  return tagTypeMap[status] || 'info'
}

onMounted(() => {
  fetchProjects()
})
</script>
