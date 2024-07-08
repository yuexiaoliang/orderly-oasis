<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { TableProps } from 'element-plus'
import { Select, Finished } from '@element-plus/icons-vue'

import { open } from '@/utils'
import { useReqMgmtStore } from '@/stores/req-mgmt'
import { reqMgmt } from '@/constants'

const reqMgmtStore = useReqMgmtStore()
const { done } = reqMgmtStore
const { pinyinGroupedList, pinyinGroupedSortedKeys } = storeToRefs(reqMgmtStore)

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
</script>

<template>
  <div class="req-mgmt-list">
    <template v-for="key in pinyinGroupedSortedKeys">
      <template v-if="pinyinGroupedList[key]?.length">
        <template v-if="key === reqMgmt.REQ_MGMT_SIDE_REQUIREMENTS">
          <div :id="reqMgmt.REQ_MGMT_TODO_ID" class="project">
            <el-card shadow="never">
              <template #header>
                <div class="project__header">
                  <h3 class="project__header__title">待完成需求</h3>
                </div>
              </template>

              <div v-for="child in pinyinGroupedList[key]" :id="child.id" class="todo-project">
                <div class="todo-project__title">{{ child.name }}</div>

                <div class="todo-project__list">
                  <div v-for="row in child.requirements" class="todo-project__list__item">
                    <el-link
                      :underline="false"
                      :type="row.finished ? 'info' : 'warning'"
                      :title="row.path"
                      @click="open(row.path)"
                    >
                      {{ row.name }}
                    </el-link>

                    <el-icon color="#409efc" class="handle-icon" @click="done(row)">
                      <Select />
                    </el-icon>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </template>

        <template v-else>
          <div v-for="child in pinyinGroupedList[key]" :id="child.id" class="project">
            <el-card shadow="never">
              <template #header>
                <div class="project__header">
                  <h3 class="project__header__title">{{ child.name }}</h3>

                  <div class="project__header__right">
                    <el-link
                      class="project__header__link"
                      :underline="false"
                      type="primary"
                      @click="open(child.path)"
                      >打开目录</el-link
                    >
                  </div>
                </div>
              </template>

              <el-table :data="child.records" row-key="id" :show-header="false" :load="load" lazy>
                <el-table-column label="名称" prop="name">
                  <template #default="{ row }">
                    <el-link
                      :underline="false"
                      :type="row.finished ? 'info' : 'warning'"
                      :title="row.path"
                      style="line-height: 1"
                      @click="open(row.path)"
                    >
                      {{ row.name }}
                    </el-link>
                  </template>
                </el-table-column>

                <el-table-column label="操作" width="44px" align="right">
                  <template #default="{ row }">
                    <template v-if="row.isTopLevel || row.finished">
                      <el-icon
                        v-if="row.finished"
                        color="#67c23a"
                        class="handle-icon handle-icon--disabled"
                      >
                        <Finished />
                      </el-icon>

                      <el-icon v-else color="#409efc" class="handle-icon" @click="done(row)">
                        <Select />
                      </el-icon>
                    </template>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </template>
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.req-mgmt-list {
  padding-bottom: var(--main-padding);

  .project {
    padding-top: 10px;

    &__header {
      display: flex;
      justify-content: space-between;

      &__title {
        margin: 0;
        font-size: 18px;
      }

      &__link {
        margin-left: 20px;
      }
    }

    .todo-project {
      margin-bottom: 20px;

      &:last-of-type {
        margin-bottom: 0;
      }

      &__title {
        margin-bottom: 10px;
        font-size: 14px;
        color: var(--el-text-color-placeholder);
      }

      &__list {
        &__item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 7px;
        }
      }
    }

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
}
</style>
