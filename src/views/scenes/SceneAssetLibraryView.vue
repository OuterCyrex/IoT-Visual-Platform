<template>
  <div class="space-y-6">
    <el-card shadow="never">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 class="text-lg font-semibold text-slate-900">3D 组件库</h2>
          <p class="mt-1 text-sm text-slate-500">模型文件只存本地路径，场景只引用资产 ID 和文件 URL。</p>
        </div>
        <div class="flex gap-3">
          <el-input v-model="keyword" placeholder="搜索名称 / 分类 / 标签" clearable class="w-72" />
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            accept=".glb,.gltf"
            @change="handleSelectFile"
          >
            <el-button type="primary">上传模型</el-button>
          </el-upload>
        </div>
      </div>
    </el-card>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <el-card v-for="item in filteredAssets" :key="item.id" shadow="hover">
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-base font-semibold text-slate-900">{{ item.name }}</div>
              <div class="mt-1 text-xs text-slate-500">{{ item.category || '未分类' }}</div>
            </div>
            <el-tag size="small">{{ item.format.toUpperCase() }}</el-tag>
          </div>

          <div class="text-sm text-slate-600">{{ item.description || '暂无描述' }}</div>

          <div class="flex flex-wrap gap-2">
            <el-tag v-for="tag in item.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
          </div>

          <div class="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            <div>源文件：{{ item.fileName }}</div>
            <div class="mt-1">存储路径：{{ item.filePath }}</div>
            <div class="mt-1">文件大小：{{ formatFileSize(item.fileSize) }}</div>
            <div class="mt-1">更新时间：{{ item.updatedAt }}</div>
          </div>

          <div class="flex justify-end gap-2">
            <el-button size="small" @click="previewAsset(item.fileUrl)">预览文件</el-button>
            <el-button size="small" type="danger" plain @click="removeAsset(item.id)">删除</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <el-empty v-if="!filteredAssets.length && !loading" description="暂无 3D 组件" />

    <el-dialog v-model="uploadDialogVisible" title="上传 3D 模型" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="模型名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入模型名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-input v-model="form.category" placeholder="如：产线设备、机器人、管道" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.tagsText" placeholder="多个标签用英文逗号分隔" />
        </el-form-item>
        <el-form-item label="已选文件">
          <div class="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {{ selectedFile?.name || '未选择文件' }}
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitUpload">确定上传</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, UploadFile } from 'element-plus'
import request from '../../utils/request'
import type { ModelAsset } from '../../types/platform'

const loading = ref(false)
const submitting = ref(false)
const assets = ref<ModelAsset[]>([])
const keyword = ref('')
const selectedFile = ref<File | null>(null)
const uploadDialogVisible = ref(false)
const formRef = ref<FormInstance>()

const form = ref({
  name: '',
  category: '',
  description: '',
  tagsText: '',
})

const rules = {
  name: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
}

const filteredAssets = computed(() => {
  if (!keyword.value) return assets.value
  const lower = keyword.value.toLowerCase()
  return assets.value.filter((item) =>
    [item.name, item.category, item.description, item.tags.join(',')].some((value) =>
      value.toLowerCase().includes(lower),
    ),
  )
})

async function fetchAssets() {
  loading.value = true
  try {
    const res: any = await request.get('/api/model-assets')
    assets.value = res.items || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function handleSelectFile(uploadFile: UploadFile) {
  if (!uploadFile.raw) return
  selectedFile.value = uploadFile.raw
  form.value = {
    name: uploadFile.raw.name.replace(/\.(glb|gltf)$/i, ''),
    category: '',
    description: '',
    tagsText: '',
  }
  uploadDialogVisible.value = true
}

async function submitUpload() {
  if (!formRef.value || !selectedFile.value) return
  const file = selectedFile.value
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload = new FormData()
      payload.append('file', file)
      payload.append('name', form.value.name)
      payload.append('category', form.value.category)
      payload.append('description', form.value.description)
      payload.append('tags', form.value.tagsText)

      await request.post('/api/model-assets', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        maxBodyLength: Infinity,
      })

      ElMessage.success('模型上传成功')
      uploadDialogVisible.value = false
      selectedFile.value = null
      await fetchAssets()
    } catch (err) {
      console.error(err)
    } finally {
      submitting.value = false
    }
  })
}

function previewAsset(fileUrl: string) {
  window.open(new URL(fileUrl, String(request.defaults.baseURL)).toString(), '_blank')
}

async function removeAsset(id: string) {
  try {
    await ElMessageBox.confirm('确定删除该模型资产吗？已被场景使用的资产不能删除。', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await request.delete(`/api/model-assets/${id}`)
    ElMessage.success('删除成功')
    await fetchAssets()
  } catch (err) {
    if (err !== 'cancel' && err !== 'close') {
      console.error(err)
    }
  }
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(2)} MB`
}

onMounted(() => {
  fetchAssets()
})
</script>
