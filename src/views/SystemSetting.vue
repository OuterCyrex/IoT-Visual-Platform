<template>
  <el-card>
    <template #header>
      <div class="font-medium">系统设置</div>
    </template>
    <el-form label-width="100px" class="max-w-xl">
      <el-form-item label="系统名称">
        <el-input model-value="IoT Visual System" />
      </el-form-item>
      <el-form-item label="主题色">
        <el-color-picker model-value="#3b82f6" />
      </el-form-item>
      <el-form-item label="自动刷新">
        <el-switch :model-value="true" />
      </el-form-item>
    </el-form>
  </el-card>
</template>
