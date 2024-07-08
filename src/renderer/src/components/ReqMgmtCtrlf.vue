<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import FilterSelect from '@/components/FilterSelect.vue'
import { useReqMgmtStore } from '@/stores/req-mgmt'
import bus from '@/utils/bus'
import { useMagicKeys } from '@vueuse/core'

const visible = ref(false)
const selectRef = ref()

const keys = useMagicKeys()
const shiftCtrlA = keys['Ctrl+F']
watch(shiftCtrlA, async (v) => {
  if (!v) return

  visible.value = !visible.value
  await nextTick()

  if (visible.value) {
    selectRef.value?.focus()
  } else {
    selectRef.value.blur()
  }
})

async function blur() {
  await nextTick()
  selectRef.value.blur()
}

const reqMgmtStore = useReqMgmtStore()
const { projectList } = storeToRefs(reqMgmtStore)

const selectEnter = (val: string, options: Project[]) => {
  const project = options.find((item) => item.name === val)
  bus.emit('on-mgmt-statistic-bar-click', project!.id)
  blur()
}

const itemClick = (item: Project) => {
  bus.emit('on-mgmt-statistic-bar-click', item.id)
  blur()
}
</script>

<template>
  <transition name="el-fade-in">
    <filter-select
      v-show="visible"
      ref="selectRef"
      class="req-mgmt-ctrlf"
      size="large"
      :options="projectList"
      :enter="selectEnter"
      :item-click="itemClick"
      placeholder="简拼 or 全拼 or 名称"
      @keyup.esc="blur"
      @blur="visible = false"
    >
    </filter-select>
  </transition>
</template>

<style lang="scss" scoped>
.req-mgmt-ctrlf {
  position: fixed;
  top: calc(var(--header-height) + 30px);
  left: 50%;
  z-index: 99999;
  transform: translateX(-50%);
  width: 520px;
  box-shadow: var(--el-box-shadow);
  background-color: var(--el-bg-color-page);

  :deep(.el-select__wrapper) {
    text-align: center;
  }
}
</style>
