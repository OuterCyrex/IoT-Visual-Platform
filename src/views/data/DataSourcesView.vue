<template>
  <div class="space-y-6">
    <el-card shadow="never">
      <div class="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <el-input v-model="keyword" placeholder="搜索数据源名称 / 地址 / 负责人" clearable />
        <el-select v-model="typeFilter" placeholder="数据源类型">
          <el-option label="全部类型" value="all" />
          <el-option label="MySQL" value="MySQL" />
          <el-option label="REST" value="REST" />
          <el-option label="MQTT" value="MQTT" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="连接状态">
          <el-option label="全部状态" value="all" />
          <el-option label="已连接" value="connected" />
          <el-option label="告警" value="warning" />
          <el-option label="失败" value="failed" />
        </el-select>
        <div class="flex justify-end gap-3">
          <el-button @click="reset">重置</el-button>
          <el-button type="primary" @click="openCreateDialog">新增数据源</el-button>
        </div>
      </div>
    </el-card>

    <div class="p-4 bg-white">
      <el-table v-loading="loading" :data="filteredSources" border>
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
          <template #default="{ row }">
            <div class="flex gap-2">
              <el-button size="small" type="primary" @click="handleTest(row)">测试连接</el-button>
              <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
              <el-button size="small" type="danger" plain @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Create/Edit Data Source Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑数据源' : '新增数据源'" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="数据源名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入数据源名称" />
        </el-form-item>
        <el-form-item label="数据源类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型" :disabled="isEdit" class="w-full"
            @change="handleTypeChange">
            <el-option label="MySQL 数据库" value="MySQL" />
            <el-option label="REST API 接口" value="REST" />
            <el-option label="MQTT Broker" value="MQTT" />
          </el-select>
        </el-form-item>
        <el-form-item label="连接地址 (Host / URL)" prop="host">
          <el-input v-model="form.host" placeholder="请输入连接地址，如: 127.0.0.1:3306" />
        </el-form-item>
        <el-form-item :label="databaseLabel" prop="database">
          <el-input v-model="form.database" placeholder="请输入库名、订阅主题或请求路径" />
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
import type { DataSource } from '../../types/platform'

type StatusKey = DataSource['status']
type TypeFilter = 'all' | DataSource['type']
type StatusFilter = 'all' | StatusKey

const loading = ref(false)
const keyword = ref('')
const typeFilter = ref<TypeFilter>('all')
const statusFilter = ref<StatusFilter>('all')
const sources = ref<DataSource[]>([])

// Form Dialog States
const dialogVisible = ref(false)
const isEdit = ref(false)
const editSourceId = ref('')
const submitting = ref(false)
const formRef = ref<FormInstance>()

const form = ref({
  name: '',
  type: 'MySQL' as DataSource['type'],
  host: '',
  database: '',
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  host: [{ required: true, message: '请输入连接地址', trigger: 'blur' }],
  database: [{ required: true, message: '请输入详情值', trigger: 'blur' }],
}

const databaseLabel = computed(() => {
  if (form.value.type === 'MQTT') return '订阅主题 (Topic)'
  if (form.value.type === 'REST') return '请求路径 (Path)'
  return '数据库名称 (Database)'
})

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

const filteredSources = computed(() => {
  return sources.value.filter((item) => {
    const matchesKeyword =
      !keyword.value ||
      item.name.toLowerCase().includes(keyword.value.toLowerCase()) ||
      item.host.toLowerCase().includes(keyword.value.toLowerCase()) ||
      item.owner.toLowerCase().includes(keyword.value.toLowerCase())
    const matchesType = typeFilter.value === 'all' || item.type === typeFilter.value
    const matchesStatus = statusFilter.value === 'all' || item.status === statusFilter.value
    return matchesKeyword && matchesType && matchesStatus
  })
})

async function fetchSources() {
  loading.value = true
  try {
    const res: any = await request.get('/api/dataSources')
    sources.value = res.items ?? []
  } finally {
    loading.value = false
  }
}

function handleTypeChange(val: DataSource['type']) {
  form.value.host = defaultHostByType(val)
  form.value.database = defaultDatabaseByType(val)
}

function openCreateDialog() {
  isEdit.value = false
  editSourceId.value = ''
  form.value = {
    name: '',
    type: 'MySQL',
    host: '127.0.0.1:3306',
    database: 'iot_visual_platform',
  }
  dialogVisible.value = true
}

function openEditDialog(row: DataSource) {
  isEdit.value = true
  editSourceId.value = row.id
  form.value = {
    name: row.name,
    type: row.type,
    host: row.host,
    database: row.database,
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const userStr = localStorage.getItem('auth_user')
      const user = userStr ? JSON.parse(userStr) : null
      const owner = user?.displayName || 'Admin'

      if (isEdit.value) {
        await request.put(`/api/dataSources/${editSourceId.value}`, {
          name: form.value.name,
          host: form.value.host,
          database: form.value.database,
          owner: owner,
          status: 'failed', // default to failed until verified
        })
        ElMessage.success('数据源更新成功')
      } else {
        await request.post('/api/dataSources', {
          ...form.value,
          owner: owner,
          status: 'failed', // default to failed until verified
        })
        ElMessage.success('数据源创建成功')
      }
      dialogVisible.value = false
      await fetchSources()
    } catch (err) {
      console.error(err)
    } finally {
      submitting.value = false
    }
  })
}

async function handleTest(row: DataSource) {
  try {
    const res: any = await request.post(`/api/data-sources/${row.id}/test`)
    if (res.reachable) {
      ElMessage.success(res.message || '测试连接成功')
      // Update data source status to connected on backend
      await request.put(`/api/dataSources/${row.id}`, {
        ...row,
        status: 'connected',
      })
    } else {
      ElMessage.error(res.message || '测试连接失败')
      await request.put(`/api/dataSources/${row.id}`, {
        ...row,
        status: 'failed',
      })
    }
    await fetchSources()
  } catch (error) {
    console.error(error)
  }
}

async function handleDelete(row: DataSource) {
  try {
    await ElMessageBox.confirm(`确定删除数据源“${row.name}”吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await request.delete(`/api/dataSources/${row.id}`)
    ElMessage.success('删除成功')
    await fetchSources()
  } catch (error: any) {
    if (error === 'cancel' || error === 'close') {
      return
    }
    console.error(error)
  }
}

function reset() {
  keyword.value = ''
  typeFilter.value = 'all'
  statusFilter.value = 'all'
}

function defaultHostByType(type: DataSource['type']) {
  if (type === 'MQTT') return '127.0.0.1:1883'
  if (type === 'REST') return 'https://api.example.local'
  return '127.0.0.1:3306'
}

function defaultDatabaseByType(type: DataSource['type']) {
  if (type === 'MQTT') return 'topic:/demo/#'
  if (type === 'REST') return '/demo'
  return 'iot_visual_platform'
}

onMounted(() => {
  fetchSources()
})
</script>
