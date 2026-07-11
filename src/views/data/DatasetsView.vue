<template>
  <div class="space-y-6">
    <el-card shadow="never">
      <div class="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <el-input v-model="keyword" placeholder="搜索数据集名称 / 表名 / 数据源" clearable />
        <el-select v-model="refreshMode" placeholder="刷新策略">
          <el-option label="全部策略" value="all" />
          <el-option label="手动" value="manual" />
          <el-option label="5 分钟" value="5 min" />
          <el-option label="实时" value="real-time" />
        </el-select>
        <el-select v-model="selectedDataSourceId" placeholder="数据源" clearable>
          <el-option label="全部数据源" value="all" />
          <el-option
            v-for="source in dataSources"
            :key="source.id"
            :label="source.type === 'MySQL' || source.type === 'REST' || source.type === 'MQTT' ? source.name : `${source.name}（暂不支持绑定）`"
            :value="source.id"
            :disabled="source.type !== 'MySQL' && source.type !== 'REST' && source.type !== 'MQTT'"
          />
        </el-select>
        <div class="flex justify-end gap-3">
          <el-button @click="reset">重置</el-button>
          <el-button type="primary" @click="handleCreate">新建数据集</el-button>
        </div>
      </div>
    </el-card>

    <div class="grid gap-5 xl:grid-cols-3">
      <el-card
        v-for="dataset in filteredDatasets"
        :key="dataset.id"
        shadow="never"
        class="border border-slate-200"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="text-base font-medium text-slate-900">{{ dataset.name }}</div>
          <el-tag size="small" type="info">{{ dataset.sourceName }}</el-tag>
        </div>
        <div class="mt-3 space-y-2 text-sm text-slate-600">
          <div>来源数据源：{{ dataset.sourceName }}</div>
          <div>数据源 ID：{{ dataset.dataSourceId }}</div>
          <div>对象名称 / 路径：{{ dataset.tableName }}</div>
          <div>字段数量：{{ dataset.fieldCount }}</div>
          <div>刷新策略：{{ refreshLabelMap[dataset.refreshMode] }}</div>
          <div>最近更新：{{ dataset.updatedAt }}</div>
        </div>
        <div class="mt-6 flex gap-2">
          <el-button size="small" type="primary" @click="handlePreview(dataset)">预览数据</el-button>
          <el-button size="small" @click="openEditDialog(dataset)">编辑</el-button>
          <el-button size="small" type="danger" plain @click="handleDelete(dataset)">删除</el-button>
        </div>
      </el-card>
    </div>

    <!-- Data Preview Dialog -->
    <el-dialog
      v-model="previewVisible"
      title="数据预览"
      width="960px"
      destroy-on-close
    >
      <div class="mb-4 text-sm text-slate-600" v-if="previewMeta">
        {{ previewMeta.sourceName }} / {{ previewMeta.tableName }} / 前 {{ previewMeta.limit }} 行
      </div>

      <el-table v-loading="previewLoading" :data="previewRows" border max-height="480">
        <el-table-column
          v-for="column in previewColumns"
          :key="column"
          :prop="column"
          :label="column"
          min-width="140"
        />
      </el-table>

      <el-empty
        v-if="!previewLoading && !previewRows.length"
        description="暂无可预览数据"
      />
    </el-dialog>

    <!-- Create/Edit Dataset Dialog -->
    <el-dialog
      v-model="createDialogVisible"
      :title="isEdit ? '编辑数据集' : '新建数据集'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="数据集名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入数据集名称" />
        </el-form-item>
        <el-form-item label="选择数据源" prop="dataSourceId">
          <el-select
            v-model="form.dataSourceId"
            placeholder="请选择数据源"
            class="w-full"
            @change="handleSourceChange"
          >
            <el-option
              v-for="source in availableSources"
              :key="source.id"
              :label="`${source.name} (${source.type})`"
              :value="source.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="selectedSourceType === 'MySQL' ? '选择 MySQL 数据表 / 视图' : selectedSourceType === 'MQTT' ? '订阅主题 (Topic)' : '请求路径 (Path)'" prop="tableName">
          <el-select
            v-if="selectedSourceType === 'MySQL'"
            v-model="form.tableName"
            placeholder="请选择 MySQL 数据表"
            class="w-full"
            :loading="tablesLoading"
            :disabled="!form.dataSourceId"
          >
            <el-option
              v-for="table in tablesList"
              :key="table"
              :label="table"
              :value="table"
            />
          </el-select>
          <el-input
            v-else
            v-model="form.tableName"
            :placeholder="selectedSourceType === 'MQTT' ? '请输入 MQTT 订阅主题，如: factory/telemetry/device-01' : '请输入 API 接口请求路径，如: /telemetry'"
            :disabled="!form.dataSourceId"
          />
        </el-form-item>
        <el-form-item label="刷新策略" prop="refreshMode">
          <el-select v-model="form.refreshMode" placeholder="请选择刷新策略" class="w-full">
            <el-option label="手动" value="manual" />
            <el-option label="5 分钟" value="5 min" />
            <el-option label="实时" value="real-time" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmitCreate">确定</el-button>
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
import type { DataSource, Dataset } from '../../types/platform'

const loading = ref(false)
const keyword = ref('')
const refreshMode = ref<'all' | Dataset['refreshMode']>('all')
const selectedDataSourceId = ref<'all' | string>('all')

const dataSources = ref<DataSource[]>([])
const datasets = ref<Dataset[]>([])
const previewVisible = ref(false)
const previewLoading = ref(false)
const previewColumns = ref<string[]>([])
const previewRows = ref<Array<Record<string, unknown>>>([])
const previewMeta = ref<null | {
  sourceName: string
  tableName: string
  limit: number
}>(null)

// Dialog variables for dataset creation and editing
const createDialogVisible = ref(false)
const isEdit = ref(false)
const editDatasetId = ref('')
const tablesLoading = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const tablesList = ref<string[]>([])
const selectedSourceType = ref<string>('')

const form = ref({
  name: '',
  dataSourceId: '',
  tableName: '',
  refreshMode: 'manual' as Dataset['refreshMode'],
})

const rules = {
  name: [{ required: true, message: '请输入数据集名称', trigger: 'blur' }],
  dataSourceId: [{ required: true, message: '请选择数据源', trigger: 'change' }],
  tableName: [{ required: true, message: '请输入或选择对象路径', trigger: 'change' }],
  refreshMode: [{ required: true, message: '请选择刷新策略', trigger: 'change' }],
}

const refreshLabelMap: Record<Dataset['refreshMode'], string> = {
  manual: '手动',
  '5 min': '5 分钟',
  'real-time': '实时',
}

const filteredDatasets = computed(() => {
  return datasets.value.filter((item) => {
    const matchesKeyword =
      !keyword.value ||
      item.name.toLowerCase().includes(keyword.value.toLowerCase()) ||
      item.tableName.toLowerCase().includes(keyword.value.toLowerCase()) ||
      item.sourceName.toLowerCase().includes(keyword.value.toLowerCase())
    const matchesRefresh = refreshMode.value === 'all' || item.refreshMode === refreshMode.value
    const matchesSource = selectedDataSourceId.value === 'all' || item.dataSourceId === selectedDataSourceId.value
    return matchesKeyword && matchesRefresh && matchesSource
  })
})

const availableSources = computed(() => dataSources.value.filter((item) => item.type === 'MySQL' || item.type === 'REST' || item.type === 'MQTT'))

async function fetchDataSources() {
  const res: any = await request.get('/api/dataSources')
  dataSources.value = res.items ?? []
}

async function fetchDatasets() {
  loading.value = true
  try {
    const res: any = await request.get('/api/datasets')
    datasets.value = res.items ?? []
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  if (!availableSources.value.length) {
    ElMessage.warning('当前没有可绑定的 MySQL、REST 或 MQTT 数据源')
    return
  }

  isEdit.value = false
  editDatasetId.value = ''
  form.value = {
    name: '',
    dataSourceId: '',
    tableName: '',
    refreshMode: 'manual',
  }
  selectedSourceType.value = ''
  tablesList.value = []
  createDialogVisible.value = true
}

async function openEditDialog(dataset: Dataset) {
  isEdit.value = true
  editDatasetId.value = dataset.id
  form.value = {
    name: dataset.name,
    dataSourceId: dataset.dataSourceId,
    tableName: dataset.tableName,
    refreshMode: dataset.refreshMode,
  }
  await handleSourceChange(dataset.dataSourceId, true)
  form.value.tableName = dataset.tableName
  createDialogVisible.value = true
}

async function handleSourceChange(sourceId: string, isInitialLoad = false) {
  if (!isInitialLoad) {
    form.value.tableName = ''
  }
  tablesList.value = []
  selectedSourceType.value = ''
  if (!sourceId) return

  const source = dataSources.value.find((s) => s.id === sourceId)
  if (source) {
    selectedSourceType.value = source.type
  }

  if (selectedSourceType.value === 'MySQL') {
    tablesLoading.value = true
    try {
      const res: any = await request.get(`/api/dataSources/${sourceId}/tables`)
      tablesList.value = res.tables || []
    } catch (err) {
      console.error('获取数据库表失败:', err)
      ElMessage.error('无法连接到所选数据源以拉取表名，请检查连接状态。')
    } finally {
      tablesLoading.value = false
    }
  }
}

async function handleSubmitCreate() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const source = availableSources.value.find((s) => s.id === form.value.dataSourceId)
      if (isEdit.value) {
        // Edit Dataset
        await request.put(`/api/datasets/${editDatasetId.value}`, {
          name: form.value.name,
          dataSourceId: form.value.dataSourceId,
          sourceName: source?.name || '',
          tableName: form.value.tableName,
          refreshMode: form.value.refreshMode,
        })
        ElMessage.success('数据集更新成功')
      } else {
        // Create Dataset
        await request.post('/api/datasets', {
          name: form.value.name,
          dataSourceId: form.value.dataSourceId,
          tableName: form.value.tableName,
          refreshMode: form.value.refreshMode,
          fieldCount: 0,
        })
        ElMessage.success('数据集创建成功')
      }
      createDialogVisible.value = false
      await fetchDatasets()
    } catch (err) {
      console.error(err)
    } finally {
      submitting.value = false
    }
  })
}

async function handlePreview(dataset: Dataset) {
  previewVisible.value = true
  previewLoading.value = true
  previewColumns.value = []
  previewRows.value = []
  previewMeta.value = {
    sourceName: dataset.sourceName,
    tableName: dataset.tableName,
    limit: 20,
  }

  try {
    const res: any = await request.get(`/api/datasets/${dataset.id}/preview`)
    previewColumns.value = res.columns ?? []
    previewRows.value = res.rows ?? []
    previewMeta.value = {
      sourceName: res.sourceName ?? dataset.sourceName,
      tableName: res.tableName ?? dataset.tableName,
      limit: Number(res.limit ?? 20),
    }
  } catch (error) {
    previewVisible.value = false
    console.error(error)
  } finally {
    previewLoading.value = false
  }
}

async function handleDelete(dataset: Dataset) {
  try {
    await ElMessageBox.confirm(`确定删除数据集“${dataset.name}”吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await request.delete(`/api/datasets/${dataset.id}`)
    ElMessage.success('删除成功')
    await fetchDatasets()
  } catch (error: any) {
    if (error === 'cancel' || error === 'close') {
      return
    }
    console.error(error)
  }
}

function reset() {
  keyword.value = ''
  refreshMode.value = 'all'
  selectedDataSourceId.value = 'all'
}

onMounted(async () => {
  await fetchDataSources()
  await fetchDatasets()
})
</script>
