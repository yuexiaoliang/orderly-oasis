<script lang="ts" setup>
import { storeToRefs } from 'pinia'

import { useReqMgmtStore } from '@/stores/req-mgmt'
import { reqMgmt } from '@/constants'
import Opener from './Opener.vue'
import Table from './ReqMgmtListTable.vue'

const reqMgmtStore = useReqMgmtStore()
const { pinyinGroupedList, pinyinGroupedSortedKeys } = storeToRefs(reqMgmtStore)
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
                <Opener class="todo-project__title" :path="child.path" is-folder>
                  {{ child.name }}
                </Opener>

                <Table :data="child.requirements" />
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
                    <Opener class="project__header__link" :path="child.path" is-folder> </Opener>
                  </div>
                </div>
              </template>

              <Table :data="child.records" />
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
        font-size: 18px;
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
    }
  }
}
</style>
