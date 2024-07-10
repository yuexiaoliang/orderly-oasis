<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Delete } from '@element-plus/icons-vue'

import { useReqMgmtStore } from '@/stores/req-mgmt'
import { useSettingStore } from '@/stores/setting'
import Add from './ReqMgmtProjectManagerAdd.vue'

const settingStore = useSettingStore()
const { deleteProject } = settingStore
const { settings } = storeToRefs(settingStore)

const reqMgmtStore = useReqMgmtStore()
const { currentProject } = storeToRefs(reqMgmtStore)
</script>

<template>
  <el-select
    v-model="currentProject"
    popper-class="req-mgmt-project-manager"
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
    >
      {{ item.name }}

      <el-popconfirm
        title="确认删除吗？"
        confirm-button-text="是"
        cancel-button-text="否"
        @confirm="deleteProject(item)"
      >
        <template #reference>
          <el-button :icon="Delete" type="danger" size="small" text @click.stop />
        </template>
      </el-popconfirm>
    </el-option>

    <template #empty>
      <el-empty description="请添加项目" :image-size="60" style="padding: 20px 0"></el-empty>
    </template>

    <template #footer>
      <Add />
    </template>
  </el-select>
</template>

<style lang="scss">
.req-mgmt-project-manager {
  .el-select-dropdown__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px 0 20px;
  }
}
</style>
