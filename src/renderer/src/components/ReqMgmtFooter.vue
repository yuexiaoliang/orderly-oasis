<script lang="ts" setup>
import { inject } from 'vue'
import { storeToRefs } from 'pinia'
import { Refresh, CaretTop } from '@element-plus/icons-vue'
import { useScroll } from '@vueuse/core'

import { injectionKeys } from '@/constants'
import { useReqMgmtStore } from '@/stores/req-mgmt'
import WebsiteOpener from '@/components/WebsiteOpener.vue'
import { useSettingStore } from '@/stores/setting'

const settingStore = useSettingStore()
const { settings } = storeToRefs(settingStore)

const { containerRef } = inject(injectionKeys.reqMgmtKey) as injectionKeys.ReqMgmtKey

const reqMgmtStore = useReqMgmtStore()
const { refresh } = reqMgmtStore
const { reading, currentProject } = storeToRefs(reqMgmtStore)

const { y } = useScroll(containerRef, {
  behavior: 'smooth'
})
</script>

<template>
  <footer class="req-mgmt-footer">
    <el-space :size="15">
      <el-select
        v-model="currentProject"
        placeholder="切换项目"
        size="small"
        value-key="name"
        style="min-width: 200px"
      >
        <el-option
          v-for="item in settings.projectList"
          :key="item.name"
          :label="item.name"
          :value="item"
        />
      </el-select>

      <WebsiteOpener />

      <el-text type="info" size="small">{{ settings['keySearch'] }} 快速搜索</el-text>
      <el-text type="info" size="small">{{ settings['keyToggle'] }} 显示/隐藏</el-text>
    </el-space>

    <el-space :size="15">
      <transition name="el-fade-in">
        <el-button
          v-show="y > 100"
          class="button"
          size="small"
          :icon="CaretTop"
          circle
          @click="y = 0"
        />
      </transition>

      <el-button
        class="button"
        type="danger"
        size="small"
        :loading="reading"
        :loading-icon="Refresh"
        :icon="Refresh"
        circle
        @click="refresh"
      />
    </el-space>
  </footer>
</template>

<style lang="scss" scoped>
.req-mgmt-footer {
  position: relative;
  z-index: 999;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: var(--footer-height);
  padding: 5px var(--main-padding);
  background-color: var(--main-bg-color);
  box-shadow: var(--el-box-shadow);
  box-sizing: border-box;

  .button {
    font-size: 14px;
    transition: all 0.2s;
  }
}
</style>
