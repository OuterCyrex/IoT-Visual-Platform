<template>
  <div class="relative flex min-h-screen items-center justify-center bg-slate-950 text-slate-100 px-4">
    <!-- Ambient glowing backgrounds -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-[128px]"></div>
      <div class="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-[128px]"></div>
    </div>

    <!-- Login Card Container -->
    <div class="relative z-10 w-full max-w-md border border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl rounded-2xl p-8">
      <div class="mb-8 text-center">
        <h2 class="text-3xl font-bold tracking-tight text-white bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          IoT Visual Platform
        </h2>
        <p class="mt-2 text-sm text-slate-400">物联网大屏可视化平台</p>
      </div>

      <el-form :model="loginForm" label-position="top" @submit.prevent="handleLogin">
        <el-form-item label="用户名" class="custom-form-item">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
          />
        </el-form-item>
        <el-form-item label="密码" class="custom-form-item">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            size="large"
          />
        </el-form-item>
        
        <div class="mt-8">
          <el-button
            type="primary"
            class="w-full custom-button"
            size="large"
            :loading="loading"
            native-type="submit"
          >
            登录
          </el-button>
        </div>
      </el-form>
      
      <div class="mt-6 text-center text-xs text-slate-500">
        默认测试账号: admin / Admin@123
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const router = useRouter()
const loading = ref(false)
const loginForm = ref({
  username: '',
  password: '',
})

async function handleLogin() {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  loading.value = true
  try {
    const res: any = await request.post('/api/auth/login', {
      username: loginForm.value.username,
      password: loginForm.value.password,
    })
    localStorage.setItem('auth_token', res.token)
    localStorage.setItem('auth_user', JSON.stringify(res.user))
    localStorage.setItem('auth_permissions', JSON.stringify(res.permissions || []))
    ElMessage.success('登录成功')
    router.push('/overview')
  } catch (err: any) {
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style>
/* Custom styling for Element Plus forms in dark mode */
.custom-form-item .el-form-item__label {
  color: #94a3b8 !important;
  font-weight: 500;
  padding-bottom: 6px !important;
}

.custom-form-item .el-input__wrapper {
  background-color: rgba(15, 23, 42, 0.4) !important;
  box-shadow: 0 0 0 1px #334155 !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.custom-form-item .el-input__wrapper.is-focus,
.custom-form-item .el-input__wrapper:hover {
  box-shadow: 0 0 0 1px #3b82f6 !important;
  background-color: rgba(15, 23, 42, 0.6) !important;
}

.custom-form-item .el-input__inner {
  color: #f8fafc !important;
}

.custom-form-item .el-input__inner::placeholder {
  color: #475569 !important;
}

/* Custom premium button */
.custom-button {
  background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%) !important;
  border: none !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25) !important;
  transition: all 0.3s ease !important;
}

.custom-button:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4) !important;
  filter: brightness(1.1) !important;
}

.custom-button:active {
  transform: translateY(0) !important;
}
</style>
