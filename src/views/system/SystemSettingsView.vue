<template>
    <el-card shadow="never">
      <template #header>
        <span class="font-medium">平台配置</span>
      </template>
      <el-form label-position="top">
        <div class="grid gap-4 md:grid-cols-2">
          <el-form-item label="平台名称">
            <el-input model-value="IoT Visual Platform" />
          </el-form-item>
          <el-form-item label="默认主题色">
            <el-color-picker model-value="#2563eb" />
          </el-form-item>
          <el-form-item label="默认数据源类型">
            <el-select model-value="MySQL">
              <el-option label="MySQL" value="MySQL" />
              <el-option label="MQTT" value="MQTT" />
              <el-option label="REST" value="REST" />
            </el-select>
          </el-form-item>
          <el-form-item label="自动刷新">
            <el-switch :model-value="true" />
          </el-form-item>
        </div>
      </el-form>
    </el-card>
</template>

<script setup lang="ts">
</script>
