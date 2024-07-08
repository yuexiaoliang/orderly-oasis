<script lang="ts" setup>
import { inject, ref, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useScroll } from '@vueuse/core'
import { Guide, DataAnalysis } from '@element-plus/icons-vue'

import { injectionKeys, reqMgmt } from '@/constants'
import { useReqMgmtStore } from '@/stores/req-mgmt'
import bus from '@/utils/bus'

const reqMgmtStore = useReqMgmtStore()
const { pinyinGroupedList, pinyinGroupedSortedKeys } = storeToRefs(reqMgmtStore)

const { containerRef } = inject(injectionKeys.reqMgmtKey) as injectionKeys.ReqMgmtKey

const handleClick = (e: MouseEvent) => {
  e.preventDefault()
}

const anchorRef = ref()

bus.on('on-mgmt-statistic-bar-click', (name) => {
  anchorRef.value.scrollTo(`#${name}`)
})
onUnmounted(() => {
  bus.off('on-mgmt-statistic-bar-click')
})

// 自动调整滚动条，使 Anchor 一直处于是口中。
const scrollRef = ref(null)
const { y: scrollTop } = useScroll(scrollRef, {
  behavior: 'smooth'
})
const handleChange = async (href: string) => {
  type EL = HTMLElement | null
  const hrefEl = document.querySelector(`a[href='${href}']`) as EL
  const scrollEl = scrollRef.value as EL
  if (!hrefEl || !scrollEl) return

  const height = scrollEl.offsetHeight
  const center = height / 2
  const top = hrefEl.offsetTop + 14 + 12

  if (top > height) {
    scrollTop.value = top - center
  } else {
    scrollTop.value = 0
  }
}
</script>

<template>
  <div ref="scrollRef" class="req-mgmt-side scrollbar">
    <el-anchor
      ref="anchorRef"
      class="req-mgmt-side-anchor"
      :container="containerRef"
      @click="handleClick"
      @change="handleChange"
    >
      <el-anchor-link :href="`#${reqMgmt.REQ_MGMT_STATISTIC_ID}`">
        <DataAnalysis class="icon" />
        概览
      </el-anchor-link>

      <el-anchor-link :href="`#${reqMgmt.REQ_MGMT_TODO_ID}`">
        <Guide class="icon" />
        待完成需求
      </el-anchor-link>

      <template v-for="key in pinyinGroupedSortedKeys">
        <template v-if="key !== reqMgmt.REQ_MGMT_SIDE_OTHER && pinyinGroupedList[key]?.length">
          <div class="group">
            <div class="group-head">{{ key }}</div>
            <el-anchor-link v-for="child in pinyinGroupedList[key]" :href="`#${child.id}`">
              {{ child.name }}
              <span style="color: var(--el-text-color-placeholder)"
                >（{{ child.requirementsLen }} / {{ child.records.length }}）</span
              >
            </el-anchor-link>
          </div>
        </template>
      </template>
    </el-anchor>
  </div>
</template>

<style lang="scss" scoped>
.req-mgmt-side {
  height: 100%;
  padding: var(--main-padding) 10px var(--main-padding) 0;
  border-left: 1px solid var(--el-border-color-light);
  box-sizing: border-box;

  &-anchor {
    --el-anchor-line-height: 16px;

    .group {
      margin-top: 15px;

      &-head {
        padding-bottom: 5px;
        color: var(--el-text-color-regular);
        font-weight: bold;
        font-size: 12px;
      }

      &:first-child {
        margin-top: 0;
      }
    }

    :deep(.el-anchor__link) {
      display: inline-flex !important;
      align-items: center;

      .icon {
        height: 1.2em;
        margin-right: 5px;
        color: var(--el-color-warning);
      }
    }
  }
}
</style>
