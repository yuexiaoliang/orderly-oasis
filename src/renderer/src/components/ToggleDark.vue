<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)
const { toggleDark } = themeStore
</script>

<template>
  <span class="toggle-dark">
    <el-switch
      v-model="isDark"
      :active-action-icon="Moon"
      :inactive-action-icon="Sunny"
      @change="toggleDark"
    />
  </span>
</template>

<style lang="scss" scoped>
.toggle-dark {
  :deep(.el-switch) {
    height: 100%;
  }

  :deep(.el-switch__core) {
    transition:
      border-color var(--el-transition-duration),
      background-color var(--el-transition-duration) !important;

    .el-switch__action {
      transition: all var(--el-transition-duration) !important;
    }
  }

  :deep(.el-switch.is-checked .el-switch__core) {
    background-color: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-light);

    .el-switch__action {
      background-color: var(--el-bg-color-page);
      color: var(--el-color-info);
    }
  }
}
</style>
