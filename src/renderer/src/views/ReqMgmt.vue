<script lang="ts" setup>
import { ref, provide } from 'vue'
import { injectionKeys } from '@/constants'

import ReqMgmtStatistic from '@/components/ReqMgmtStatistic.vue'
import ReqMgmtFooter from '@/components/ReqMgmtFooter.vue'
import ReqMgmtList from '@/components/ReqMgmtList.vue'
import ReqMgmtSide from '@/components/ReqMgmtSide.vue'
import ReqMgmtCtrlf from '@/components/ReqMgmtCtrlf.vue'

const containerRef = ref()
provide(injectionKeys.reqMgmtKey, {
  containerRef
})
</script>

<template>
  <el-container class="req-mgmt">
    <el-container style="height: calc(100% - var(--footer-height))">
      <el-main class="req-mgmt-main">
        <div ref="containerRef" class="req-mgmt-main-container scrollbar">
          <ReqMgmtStatistic />
          <ReqMgmtList />
        </div>
      </el-main>

      <el-aside width="240">
        <ReqMgmtSide />
      </el-aside>
    </el-container>

    <el-footer style="height: var(--footer-height); padding: 0">
      <ReqMgmtFooter />
    </el-footer>

    <ReqMgmtCtrlf />
  </el-container>
</template>

<style lang="scss" scoped>
.req-mgmt {
  height: 100%;

  &-main {
    padding: 0;

    &-container {
      padding: 0 var(--main-padding);
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      box-sizing: border-box;
    }
  }
}
</style>
