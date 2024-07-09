<script setup lang="ts">
import { TopRight, FolderOpened } from '@element-plus/icons-vue'
import { open } from '@/utils'

defineProps<{
  path: string

  // 点击文字是否打开
  openText?: boolean

  isFolder?: boolean

  hideIcon?: boolean
}>()
</script>

<template>
  <el-text
    class="opener"
    :class="{
      'opener-text': openText
    }"
    @click="openText ? open(path) : null"
  >
    <slot></slot>

    <el-button
      v-if="!hideIcon"
      :icon="isFolder ? FolderOpened : TopRight"
      :type="isFolder ? 'success' : 'primary'"
      class="icon"
      link
      @click.stop="open(path)"
    />
  </el-text>
</template>

<style lang="scss" scoped>
.opener {
  &.opener-text {
    transition: opacity 0.2s;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  .icon {
    display: inline;
    padding: 0 3px;
    font-size: inherit;
  }
}
</style>
