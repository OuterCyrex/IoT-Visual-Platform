<template>
  <div class="space-y-6">
    <el-card shadow="never">
      <div class="grid gap-4 lg:grid-cols-[2fr_1fr_auto]">
        <el-input v-model="keyword" placeholder="搜索账号 / 姓名 / 手机号" clearable />
        <el-select v-model="status" placeholder="账号状态">
          <el-option label="全部状态" value="all" />
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        <div class="flex justify-end gap-3">
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="primary" @click="openCreateDialog">新增账号</el-button>
        </div>
      </div>
    </el-card>

    <el-table v-loading="loading" :data="filteredUsers" border>
      <el-table-column prop="username" label="账号" min-width="140" />
      <el-table-column prop="displayName" label="姓名" min-width="120" />
      <el-table-column prop="role" label="角色" min-width="140" />
      <el-table-column prop="phone" label="手机号" min-width="140" />
      <el-table-column prop="updatedAt" label="最近更新" min-width="160" />
      <el-table-column label="状态" min-width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="280" fixed="right">
        <template #default="{ row }">
          <div class="flex gap-2">
            <el-button size="small" type="primary" @click="openEditDialog(row)">编辑资料</el-button>
            <el-button size="small" @click="handleResetPassword(row)">重置密码</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(row.id)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- Create/Edit User Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑账号' : '新增账号'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" placeholder="请输入登录账号" />
        </el-form-item>
        <el-form-item label="姓名" prop="displayName">
          <el-input v-model="form.displayName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" class="w-full">
            <el-option
              v-for="role in rolesList"
              :key="role.name"
              :label="role.name"
              :value="role.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!isEdit" label="初始密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入初始密码" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
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
import type { PlatformUser } from '../../types/platform'

const users = ref<PlatformUser[]>([])
const rolesList = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)

const keyword = ref('')
const status = ref<'all' | 'active' | 'disabled'>('all')

const dialogVisible = ref(false)
const isEdit = ref(false)
const editUserId = ref('')
const formRef = ref<FormInstance>()

const form = ref({
  username: '',
  displayName: '',
  phone: '',
  role: '',
  password: '',
  status: 'active' as 'active' | 'disabled',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  displayName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

async function fetchUsers() {
  loading.value = true
  try {
    const res: any = await request.get('/api/users')
    users.value = res.items || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function fetchRoles() {
  try {
    const res: any = await request.get('/api/roles')
    rolesList.value = res.items || []
  } catch (err) {
    console.error(err)
  }
}

const filteredUsers = computed(() => {
  return users.value.filter((item) => {
    const matchesKeyword =
      !keyword.value ||
      item.username.toLowerCase().includes(keyword.value.toLowerCase()) ||
      item.displayName.toLowerCase().includes(keyword.value.toLowerCase()) ||
      item.phone.includes(keyword.value)
    const matchesStatus = status.value === 'all' || item.status === status.value
    return matchesKeyword && matchesStatus
  })
})

function resetQuery() {
  keyword.value = ''
  status.value = 'all'
}

function openCreateDialog() {
  isEdit.value = false
  editUserId.value = ''
  form.value = {
    username: '',
    displayName: '',
    phone: '',
    role: '',
    password: 'ChangeMe123!',
    status: 'active',
  }
  dialogVisible.value = true
}

function openEditDialog(row: PlatformUser) {
  isEdit.value = true
  editUserId.value = row.id
  form.value = {
    username: row.username,
    displayName: row.displayName,
    phone: row.phone,
    role: row.role,
    password: '',
    status: row.status as 'active' | 'disabled',
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
        // Edit User
        await request.put(`/api/users/${editUserId.value}`, {
          displayName: form.value.displayName,
          phone: form.value.phone,
          role: form.value.role,
          status: form.value.status,
        })
        ElMessage.success('更新成功')
      } else {
        // Create User
        await request.post('/api/users', form.value)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchUsers()
    } catch (err) {
      console.error(err)
    } finally {
      submitting.value = false
    }
  })
}

async function handleResetPassword(row: PlatformUser) {
  ElMessageBox.prompt('请输入新密码', `重置 ${row.displayName} 的密码`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '密码不能为空',
  }).then(async ({ value }) => {
    try {
      await request.post(`/api/users/${row.id}/resetPassword`, {
        password: value,
      })
      ElMessage.success('密码重置成功')
    } catch (err) {
      console.error(err)
    }
  })
}

async function handleDelete(id: string) {
  ElMessageBox.confirm('确定要删除该账号吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await request.delete(`/api/users/${id}`)
      ElMessage.success('删除成功')
      fetchUsers()
    } catch (err) {
      console.error(err)
    }
  })
}

onMounted(() => {
  fetchUsers()
  fetchRoles()
})
</script>
