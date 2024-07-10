<script setup lang="ts">
import { ref, computed } from 'vue'
import { Setting, Close, Minus, FullScreen, CopyDocument } from '@element-plus/icons-vue'
import { useElementSize } from '@vueuse/core'
import ToggleDark from './ToggleDark.vue'
import AppSetting from './AppSetting.vue'

const buttonsRef = ref()
const { width } = useElementSize(buttonsRef)
const buttonsWidth = computed(() => width.value + 'px')

const isMaximize = ref(false)

// 关闭窗口
const onClose = () => {
  window.ipc.hideAppWindow()
}

// 最小化窗口
const onMinimize = () => {
  window.ipc.minimizeAppWindow()
}

// 最大化窗口
const onMaximize = () => {
  isMaximize.value = true
  window.ipc.maximizeAppWindow()
}

// 取消最大化窗口
const onUnMaximize = () => {
  isMaximize.value = false
  window.ipc.unmaximizeAppWindow()
}

const settingVisible = ref(false)
</script>

<template>
  <header class="base-header">
    <div
      class="drag-area"
      :style="{
        '--buttons-width': buttonsWidth
      }"
    ></div>

    <img src="@resources/icon.png" class="logo" />

    <div ref="buttonsRef" class="control-buttons">
      <ToggleDark style="margin-right: 10px" />

      <!-- 设置 -->
      <el-button :icon="Setting" class="button" text @click="settingVisible = true" />

      <!-- 最小化窗口 -->
      <el-button :icon="Minus" class="button" text @click="onMinimize" />

      <!-- 最大化窗口 -->
      <el-button
        v-if="!isMaximize"
        :icon="FullScreen"
        class="button screen"
        text
        @click="onMaximize"
      />

      <!-- 取消最大化窗口 -->
      <el-button v-else :icon="CopyDocument" class="button screen" text @click="onUnMaximize" />

      <!-- 关闭窗口 -->
      <el-button :icon="Close" class="button" text @click="onClose" />
    </div>
  </header>

  <AppSetting v-model="settingVisible" />
</template>

<style lang="scss">
.base-header {
  position: relative;
  z-index: 999;
  width: 100%;
  height: var(--header-height);
  display: flex;
  align-items: center;
  background-color: var(--main-bg-color);
  box-shadow: var(--el-box-shadow);

  .drag-area {
    position: absolute;
    top: 0;
    right: var(--buttons-width, 100px);
    left: 0;
    bottom: 0;
    -webkit-app-region: drag;
  }

  .logo {
    display: block;
    margin-left: var(--main-padding);
    margin-right: 10px;
    height: 52%;
  }

  .control-buttons {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 9999;
    display: flex;
    height: 100%;

    .button {
      height: 100%;
      padding: 0 10px;
      margin-left: 0;
      border-radius: 0;
      font-size: 1em;

      &.screen {
        font-size: 0.8em;
      }
    }
  }
}
</style>
