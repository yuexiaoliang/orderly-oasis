<script lang="ts" setup>
import LayoutHeader from '@/components/LayoutHeader.vue'
import ReqMgmt from '@/views/ReqMgmt.vue'
</script>

<template>
  <el-container class="app">
    <el-header style="padding: 0; height: var(--header-height)">
      <LayoutHeader />
    </el-header>

    <el-main style="padding: 0">
      <ReqMgmt />
    </el-main>
  </el-container>
</template>

<style lang="scss">
.app {
  position: relative;
  height: 100%;
}
</style>
