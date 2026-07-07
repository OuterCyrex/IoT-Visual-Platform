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
        </el-select>
        <el-select v-model="group" placeholder="大屏分组">
          <el-option label="全部分组" value="all" />
          <el-option v-for="item in groups" :key="item" :label="item" :value="item" />
        </el-select>
        <div class="flex justify-end gap-3">
          <el-button @click="reset">重置</el-button>
          <el-button type="primary" @click="handleCreate">新建大屏</el-button>
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
        <el-table-column label="操作" min-width="280" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <el-button size="small" type="success" plain @click="openPreview(row.id)">预览</el-button>
              <el-button size="small" type="primary" @click="openEditor(row.id)">编辑</el-button>
              <el-button size="small" @click="handlePublish(row)">发布</el-button>
              <el-button size="small" type="danger" plain @click="handleDelete(row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../../utils/request'
import type { ScreenProject, ProjectStatus } from '../../types/platform'

const router = useRouter()
const projects = ref<ScreenProject[]>([])
const loading = ref(false)

const keyword = ref('')
const status = ref<'all' | ProjectStatus>('all')
const group = ref<'all' | string>('all')

const groups = computed(() => [...new Set(projects.value.map((item) => item.group))])

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

async function handleCreate() {
  ElMessageBox.prompt('请输入大屏项目名称', '新建大屏', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '名称不能为空',
  }).then(async ({ value }) => {
    try {
      const userStr = localStorage.getItem('auth_user')
      const user = userStr ? JSON.parse(userStr) : null
      const owner = user?.displayName || 'Admin'

      await request.post('/api/screenProjects', {
        name: value,
        group: '默认分组',
        scene: '无',
        owner: owner,
        status: 'draft',
        publishedVersion: '未发布',
        tags: [],
        screenNodes: [],
      })
      ElMessage.success('创建成功')
      fetchProjects()
    } catch (err) {
      console.error(err)
    }
  })
}

async function handleDelete(id: string) {
  ElMessageBox.confirm('确定要删除该大屏项目吗？此操作不可恢复！', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await request.delete(`/api/screenProjects/${id}`)
      ElMessage.success('删除成功')
      fetchProjects()
    } catch (err) {
      console.error(err)
    }
  })
}

async function handlePublish(row: ScreenProject) {
  const currentVer = row.publishedVersion || '未发布'
  ElMessageBox.prompt(
    `请输入发布版本号（留空则系统自动递增。当前版本：${currentVer}）`,
    '发布大屏',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '如: 1.0.0 或 0.2',
    }
  ).then(async ({ value }) => {
    try {
      await request.post(`/api/screenProjects/${row.id}/publish`, {
        version: value ? value.trim() : undefined,
      })
      ElMessage.success('发布成功')
      fetchProjects()
    } catch (err) {
      console.error(err)
    }
  }).catch(() => { })
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
})
</script>
