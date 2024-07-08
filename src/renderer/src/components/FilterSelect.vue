<script setup lang="ts">
import { ref, watch } from 'vue'
import { selectFilter } from '@/utils'
import { addPinyinForList } from '@common/index'

const props = defineProps<{
  options: any[]
  enter?: (val: any, options: any[]) => void
  itemClick?: (val: any) => void
  placeholder?: string
}>()

const selectRef = ref()
const selectVal = ref('')

let rawSelectList = addPinyinForList(props.options)
const selectList = ref(rawSelectList)

watch(
  () => props.options,
  (val) => {
    rawSelectList = addPinyinForList(val)
    selectList.value = addPinyinForList(val)
  }
)

const selectEnter = () => {
  if (!selectVal.value) return

  if (typeof props.enter === 'function') props.enter(selectVal.value, selectList.value)

  selectVal.value = ''
}

const onItemClick = (item: any) => {
  if (typeof props.itemClick === 'function') props.itemClick(item)

  selectVal.value = ''
}

const filter = (val: any) => {
  selectList.value = selectFilter(val, rawSelectList)
}

const focus = () => {
  selectRef.value?.focus()
}

const blur = () => {
  selectRef.value?.blur()
}

defineExpose({
  focus,
  blur
})
</script>

<template>
  <el-select
    ref="selectRef"
    v-model="selectVal"
    class="filter-select"
    style="min-width: 200px"
    filterable
    :filter-method="filter"
    :placeholder="placeholder || '选择 or 搜索'"
    size="small"
    @keyup.enter.native="selectEnter"
  >
    <el-option
      v-for="item in selectList"
      :key="item.name"
      :label="item.label"
      :value="item.name"
      @click="onItemClick(item)"
      ><slot v-bind="item">{{ item.name }}</slot></el-option
    >
  </el-select>
</template>
