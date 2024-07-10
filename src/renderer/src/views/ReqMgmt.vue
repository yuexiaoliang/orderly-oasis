<script lang="ts" setup>
import { ref, provide } from 'vue'
import { injectionKeys } from '@/constants'

import ReqMgmtStatistic from '@/components/ReqMgmtStatistic.vue'
import ReqMgmtFooter from '@/components/ReqMgmtFooter.vue'
import ReqMgmtList from '@/components/ReqMgmtList.vue'
import ReqMgmtSide from '@/components/ReqMgmtSide.vue'
import ReqMgmtCtrlf from '@/components/ReqMgmtCtrlf.vue'
import Add from '@/components/ReqMgmtProjectManagerAdd.vue'

import { useReqMgmtStore } from '@/stores/req-mgmt'

const reqMgmtStore = useReqMgmtStore()

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
          <template v-if="reqMgmtStore.projectList?.length">
            <ReqMgmtStatistic />
            <ReqMgmtList />
          </template>
          <el-empty v-else style="margin-top: 50px" description="资源为空">
            <Add />
          </el-empty>
        </div>
      </el-main>

      <el-aside width="200px">
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
