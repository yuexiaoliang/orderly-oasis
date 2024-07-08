<script setup lang="ts">
import { onUnmounted, computed } from 'vue'
import { open, bus } from '@/utils/index'
import { useSettingStore } from '@/stores/setting'
import FilterSelect from '@/components/FilterSelect.vue'

const settingStore = useSettingStore()
const websiteList = computed(() => {
  return settingStore.settings['websiteList']
})

bus.on('refresh', () => {
  settingStore.getSettings()
})

onUnmounted(() => {
  bus.off('refresh')
})

const selectEnter = (val: any, options: any[]) => {
  const item = options.find((el: any) => el.name === val)
  if (item) openLink(item)
}

const openLink = (item: any) => {
  if (Array.isArray(item.links)) {
    open(item.links[0].href)
  } else {
    open(item.links)
  }
}
</script>

<template>
  <filter-select :options="websiteList" :enter="selectEnter" placeholder="网站快开">
    <template #default="item">
      <div class="website-opener__option">
        <span class="label" @click="openLink(item)">{{ item.name }}</span>

        <div v-if="Array.isArray(item.links)" class="buttons">
          <span v-for="link in item.links" class="button" @click="open(link.href)">
            {{ link.name }}
          </span>
        </div>
      </div>
    </template>
  </filter-select>
</template>

<style lang="scss" scoped>
.website-opener {
  width: 280px;

  &__option {
    display: flex;
    justify-content: space-between;

    .button {
      margin-left: 10px;
      font-size: 12px;
      font-weight: normal;
      color: var(--el-color-primary);
    }
  }
}
</style>
