<script setup lang="ts">
import type { TableProps, TableInstance } from 'element-plus'
import { Select, Finished } from '@element-plus/icons-vue'

import { useReqMgmtStore } from '@/stores/req-mgmt'
import Opener from './Opener.vue'

defineProps<{
  data: TableInstance['data']
}>()

const reqMgmtStore = useReqMgmtStore()
const { done } = reqMgmtStore

const load: TableProps<ProjectItem>['load'] = async (item, _, resolve) => {
  const _children = await window.electron.ipcRenderer.invoke('readdir-children', item.path)

  const children = _children.map((child) => {
    return {
      ...child,
      finished: item.finished
    }
  })

  item.children = children
  resolve(children)
}

const handleCellClick: TableInstance['onCell-click'] = (_row, column, _cell, event) => {
  if (column.property === 'name') {
    const expand = event.currentTarget.querySelector('.el-table__expand-icon')

    expand?.click()
  }
}
</script>

<template>
  <div class="req-mgmt-list-table">
    <el-table
      :data="data"
      :show-header="false"
      :load="load"
      row-key="id"
      lazy
      @cell-click="handleCellClick"
    >
      <el-table-column label="名称" prop="name">
        <template #default="{ row }">
          <Opener
            :path="row.path"
            :type="row.finished ? 'info' : 'warning'"
            :hide-icon="!row.hasChildren"
            :open-text="!row.hasChildren"
            :is-folder="row.hasChildren"
            style="cursor: pointer"
          >
            {{ row.name }}
          </Opener>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="44px" align="right">
        <template #default="{ row }">
          <template v-if="row.isTopLevel || row.finished">
            <el-icon v-if="row.finished" color="#67c23a" class="handle-icon handle-icon--disabled">
              <Finished />
            </el-icon>

            <el-icon v-else color="#409efc" class="handle-icon" @click="done(row)">
              <Select />
            </el-icon>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss" scoped>
.req-mgmt-list-table {
  .handle-icon {
    cursor: pointer;

    &--disabled {
      cursor: auto;
    }
  }

  :deep(.el-table .cell) {
    display: flex;
    align-items: center;
  }

  :deep(.el-table .el-table__cell.is-right .cell) {
    justify-content: flex-end;
  }

  :deep(.el-table tr) {
    background-color: transparent;
  }

  :deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
    background-color: transparent;
  }

  :deep(.el-table td.el-table__cell div) {
    padding: 0;
  }
}
</style>
