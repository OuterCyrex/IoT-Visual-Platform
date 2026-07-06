<template>
  <div class="space-y-6">
    <el-card shadow="never">
      <div class="grid gap-4 lg:grid-cols-[2fr_1fr_auto]">
        <el-input placeholder="搜索账号 / 姓名 / 手机号" />
        <el-select placeholder="账号状态">
          <el-option label="全部状态" value="all" />
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        <div class="flex justify-end gap-3">
          <el-button>重置</el-button>
          <el-button type="primary">新增账号</el-button>
        </div>
      </div>
    </el-card>

    <el-table :data="users" border>
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
        <template #default>
          <div class="flex gap-2">
            <el-button size="small" type="primary">编辑资料</el-button>
            <el-button size="small">重置密码</el-button>
            <el-button size="small">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { platformUsers as users } from '../../mock/platform'
</script>
