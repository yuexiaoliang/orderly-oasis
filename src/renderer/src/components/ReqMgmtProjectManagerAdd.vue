<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'

import { useSettingStore } from '@/stores/setting'

const settingStore = useSettingStore()
const { addProject } = settingStore
</script>

<template>
  <el-button :icon="Plus" style="width: 100%" size="small" text @click="addProject"
    >添加项目</el-button
  >
</template>
